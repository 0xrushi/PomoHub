import time
import asyncio
import configparser
import logging
from textual.app import App, ComposeResult
from textual.widgets import Button, Label, Input, Static
from textual.containers import Container, Horizontal
from textual.reactive import reactive
import socketio
import os
from rich.columns import Columns
from importlib import resources
from rich.panel import Panel
from rich.text import Text

from textual.widgets import Static
logging.basicConfig(level=logging.DEBUG)

class MemberList(Static):
    def __init__(self):
        super().__init__("No active members", id="member_list")
        self.members = []

    def update_members(self, members):
        self.members = members
        self.update(self.get_member_display())
        print(f"Member list updated: {[member['name'] for member in self.members]}")

    def get_member_display(self):
        if not self.members:
            return "No active members"
        
        member_panels = [
            Panel(
                Text(member.get('name', 'Unknown'), style="bold"),
                border_style="orange_red1",
                expand=False,
                padding=(0, 1),
                height=4,
            ) for member in self.members
        ]
        return Columns(member_panels, expand=False, equal=True, align="center")

class PomodoroApp(App):
    CSS = """
    Screen {
        align: center middle;
    }

    #timer {
        content-align: center middle;
        width: 100%;
        height: 3;
    }

    #username_input {
        width: 100%;
    }

    Button {
        width: 100%;
    }

    #status {
        height: 1;
    }

     #main {
        width: 60;
        height: auto;
        border: solid green;
        padding: 1 2;
    }

    #member_list {
        height: 5;
        width: 100%;
        max-height: 10; 
        overflow-y: auto;
    }
    #member_container {
        height: 5;
        width: 100%;
        padding: 0;
        align: center middle;
    }
    """

    timer_text = reactive("00:00")
    connection_status = reactive("Disconnected")
    is_running = reactive(False)

    def __init__(self):
        super().__init__()
        self.sio = socketio.AsyncClient()
        self.setup_socket_events()
        self.countdown = {"minutes": 50, "seconds": 0}
        self.logger = logging.getLogger(__name__)
        self.last_sync_time = time.time()
        self.member_list = MemberList()
        self.config = self.read_config()
        self.server_url = self.config.get('SERVER_API_URL', 'url')
    
    def read_config(self):
        config = configparser.ConfigParser()
        config_file_path = os.path.join(os.path.dirname(__file__), 'config.ini')
        config.read(config_file_path)
        return config


    username_submitted = reactive(False)

    def compose(self) -> ComposeResult:
        yield Container(
            Label("Welcome to PomoHub TUI", id="title"),
            Static(id="timer", disabled=True),
            Input(placeholder="Enter time in minutes", id="time_input", disabled=True, value='50'),
            Input(placeholder="Enter your username", id="username_input", disabled=False),
            Button("Submit Username", id="submit_username", disabled=False),
            Button("Start", id="start_stop", disabled=True),
            Button("Reset", id="reset", disabled=True),
            Label("Status", id="status"),
            Label("Members:", id="members_label"),
            Horizontal(self.member_list, id="member_container"),
            id="main"
        )

    def setup_socket_events(self):
        @self.sio.event
        async def connect():
            self.connection_status = "Connected"
            self.logger.debug("Connected to server")

        @self.sio.event
        async def disconnect():
            self.connection_status = "Disconnected"
            self.logger.debug("Disconnected from server")

        @self.sio.on("timer update")
        def on_timer_update(data):
            if 'countdown' in data and 'minutes' in data['countdown'] and 'seconds' in data['countdown']:
                server_time = data["countdown"]["minutes"] * 60 + data["countdown"]["seconds"]
                local_time = self.countdown["minutes"] * 60 + self.countdown["seconds"]
                # Only update if difference is more than 2 seconds
                if abs(server_time - local_time) > 2:  
                    self.countdown = {
                        "minutes": int(data["countdown"]["minutes"]),
                        "seconds": int(data["countdown"]["seconds"])
                    }
                    self.is_running = data.get("isRunning", False)
                    self.update_timer_display()
                    self.logger.debug(f"Synced with server: {data}")
            else:
                self.logger.warning(f"Received invalid timer update data: {data}")

        @self.sio.on("update user list")
        def on_update_user_list(data):
            self.logger.debug(f"Received user list update: {data}")
            if isinstance(data, list):
                self.query_one(MemberList).update_members(data)
                self.logger.debug(f"Updated user list: {data}")
            else:
                self.logger.warning(f"Received invalid user list data: {data}")
    def update_timer_display(self):
        if self.username_submitted:
            self.timer_text = f"{self.countdown['minutes']:02d}:{self.countdown['seconds']:02d}"
            self.query_one("#timer").update(self.timer_text)

    def decrement_timer(self):
        if self.countdown['seconds'] > 0:
            self.countdown['seconds'] -= 1
        elif self.countdown['minutes'] > 0:
            self.countdown['minutes'] -= 1
            self.countdown['seconds'] = 59
        else:
            self.is_running = False
            self.logger.info("Timer finished")
        self.update_timer_display()

    async def on_button_pressed(self, event: Button.Pressed) -> None:
        button_id = event.button.id
        
        if not self.sio.connected:
            self.notify("Not connected to server", severity="error")
            return

        if button_id == "submit_username":
            username = self.query_one("#username_input").value
            if username.strip():
                await self.sio.emit("submit username", username)
                self.notify(f"Username submitted: {username}")
                self.username_submitted = True
                self.update_button_states()
            else:
                self.notify("Please enter a valid username", severity="error")
            
        elif button_id == "start_stop":
            if not self.is_running:
                time_input = self.query_one("#time_input").value
                try:
                    minutes = int(time_input)
                    self.countdown = {"minutes": minutes, "seconds": 0}
                    self.is_running = True
                    await self.sio.emit("start timer", {
                        "countdown": {
                            "minutes": int(self.countdown['minutes']),
                            "seconds": int(self.countdown['seconds'])
                        },
                        "isRunning": True
                    })
                    self.query_one("#start_stop").label = "Stop Timer"
                    self.notify("Timer started")
                except ValueError:
                    self.notify("Please enter a valid number of minutes", severity="error")
            else:
                self.is_running = False
                await self.sio.emit("stop timer")
                self.query_one("#start_stop").label = "Start"
                self.notify("Timer stopped")
        elif button_id == "reset":
            self.countdown = {"minutes": 0, "seconds": 0}
            self.is_running = False
            await self.sio.emit("reset timer", {
                "countdown": {
                    "minutes": 50,
                    "seconds": 0
                },
                "isRunning": False
            })
            self.update_timer_display()
            self.query_one("#start_stop").label = "Start"
            self.query_one("#time_input").value = ""
            self.notify("Timer reset")


    def on_mount(self) -> None:
        self.update_timer_display()
        self.set_interval(1, self.update_timer)
        asyncio.create_task(self.connect_to_server())
        self.update_button_states()
    
    def update_button_states(self) -> None:
        start_stop_button = self.query_one("#start_stop", Button)
        reset_button = self.query_one("#reset", Button)
        time_input_input = self.query_one("#time_input", Input)
        timer_status = self.query_one("#timer", Static)
        submit_username_button = self.query_one("#submit_username", Button)
        username_input_input = self.query_one("#username_input", Input)
        
        
        start_stop_button.disabled = not self.username_submitted
        reset_button.disabled = not self.username_submitted
        time_input_input.disabled = not self.username_submitted
        timer_status.disabled = not self.username_submitted
        
        submit_username_button.disabled = self.username_submitted
        username_input_input.disabled = self.username_submitted
        

    def update_timer(self):
        if self.is_running:
            self.decrement_timer()
        
        current_time = time.time()
        # Sync every 5 seconds
        if current_time - self.last_sync_time >= 5:
            self.last_sync_time = current_time
            if self.sio.connected:
                asyncio.create_task(self.sync_with_server())

    async def sync_with_server(self):
        await self.sio.emit("sync timer", {
            "countdown": {
                "minutes": int(self.countdown['minutes']),
                "seconds": int(self.countdown['seconds'])
            },
            "isRunning": self.is_running
        })

    async def connect_to_server(self):
        server_url = self.server_url
        try:
            if not self.sio.connected:
                await self.sio.connect(server_url)
                await self.notify(f"Connected to server: {server_url}")
        except Exception as e:
            # await self.notify(f"Failed to connect: {str(e)}", severity="error")
            # self.logger.error(f"Connection error: {str(e)}")
            pass

    def watch_connection_status(self, new_status: str) -> None:
        self.query_one("#status").update(new_status)

    def log_state(self):
        self.logger.debug(f"Current state - countdown: {self.countdown}, is_running: {self.is_running}")


def main():
    app = PomodoroApp()
    app.run()
    
if __name__ == "__main__":
    main()