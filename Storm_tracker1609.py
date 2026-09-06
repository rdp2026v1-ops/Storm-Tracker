import math
import tkinter as tk
from tkinter import *
from tkinter import ttk
from tkinter import messagebox
from tkinter.messagebox import showinfo
from tkinter.filedialog import askopenfile
from tkVideoPlayer import TkinterVideo
import pygame
from moviepy.editor import VideoFileClip
import os
import pandas as pd
import openpyxl
from openpyxl import load_workbook
import PIL
from PIL import Image, ImageTk
# from storm_rotation import *
import time


# Global variables for storing storm locations and typhoon data
Locations = []
location_tuple = []
location_tuple_2 = []
storm_conditions = []
previous_typhoon_data = []
storm_animation = None
play_sound = None
lt_text_1 = None
lt_text_2 = None
tracking_counter = 0
rel_x = 0
rel_y = 0
rel_ang = 0
GEM = "#00C4FF"
YELLOW = "#EBE76C"
ORANGE = "#F94C10"
storm_image_path = "C:\Storm_tracker_data/storm.png"
background_image_path = "C:\Storm_tracker_data/background1609.png"
# arrow_image_path = "C:\Storm_tracker_data/red-arrow.png"
sound_path = "C:\Storm_tracker_data/Tieng-Sam-Set.mp3"
explanation_path = "C:\Storm_tracker_data/Explanation.png"
wind_scale_path = "C:\Storm_tracker_data/Beaufort wind scale.png"
video_path_1 = "C:\Storm_tracker_data/Lv1_7"
video_path_2 = "C:\Storm_tracker_data/Lv8_11"
video_path_3 = "C:\Storm_tracker_data/Lv12_higher"

ting_sound = "C:\Storm_tracker_data/tieng_ting.mp3"

filepath = 'C:\Storm_tracker_data\saved data.xlsx'

# Show wind scale on the screen:
wind_scale_image = None


def show_wind_scale():
    global wind_scale_image
    wind_scale_window = tk.Toplevel()
    wind_scale_window.title("Wind scale")
    wind_scale_window.geometry('740x900+480+20')
    resize_wind_scale_img = Image.open(wind_scale_path)
    resize_wind_scale_img = resize_wind_scale_img.resize(
        (740, 900), Image.LANCZOS)
    wind_scale_image = ImageTk.PhotoImage(resize_wind_scale_img)
    image_label_2 = tk.Label(wind_scale_window, image=wind_scale_image)

    image_label_2.pack()
    wind_scale_window.mainloop()


# create a function to show an image on a top of other windows by using Toplevel function of tkinter
explanation_image = None


def show_explanation():
    global explanation_image
    explanation_window = tk.Toplevel()
    explanation_window.title("Explanation")
    explanation_window.geometry('820x920+480+5')
    resize_exp_img = Image.open(explanation_path)
    resize_exp_img = resize_exp_img.resize((820, 920), Image.LANCZOS)
    explanation_image = ImageTk.PhotoImage(resize_exp_img)

    image_label = tk.Label(explanation_window, image=explanation_image)
    image_label.pack()

    explanation_window.mainloop()

# Play video with sound:


def get_audio(file):
    # Check if the MP3 file already exists
    if not os.path.exists(file + ".mp3"):
        # Load the .mp4 file
        video = VideoFileClip(file + ".mp4")
        # Extract the audio from the .mp4 file
        audio = video.audio
        # Write the audio to a new file
        audio.write_audiofile(file + ".mp3")


def play_video(file):
    # Load the audio file
    pygame.init()
    pygame.mixer.init()
    pygame.mixer.music.load(file + ".mp3")
    # Initialize the video player
    video_window = tk.Toplevel()
    video_window.title("Wind & Storm 3D Animation")
    video_window.geometry('1350x840+250+10')
    video_player = TkinterVideo(video_window, scaled=True)
    video_player.load(file + ".mp4 ")
    video_player.pack(expand=True, fill="both")
    # Loop video playback

    def replay():
        video_player.play()
        video_window.after(10, replay)

    def on_close():
        pygame.mixer.music.stop()
        video_player.stop()
        video_window.destroy()

    # Start video loop
    replay()

    # Set the close event handler
    video_window.protocol("WM_DELETE_WINDOW", on_close)

    pygame.mixer.music.play(loops=-1)  # loop music
    video_window.mainloop()


# Draw circles with central point at (home_x, home_y) with diameters: 900, 600, 300, 150:
def define_home():
    global lon_scale, lat_scale, home_x, home_y, screen_height, screen_width, corner1_lat, corner1_lon, corner3_lat, corner3_lon
    # Background corners coordinates
    corner1_lat, corner1_lon = 25, 90
    corner2_lat, corner2_lon = 0, 90
    corner3_lat, corner3_lon = 0, 134.45
    corner4_lat, corner4_lon = 25, 134.45
    # Scale factor = (screen_height/screen_width)/(picture_height/picture_width); picture_height = 25, picture_width = 40.
    # scale_factor = 1.0

    # Calculate the scale factors for latitude and longitude
    screen_scale = screen_width / screen_height
    picture_scale = (corner4_lon - corner2_lon)/(corner4_lat - corner2_lat)
    # scale_factor = screen_scale / picture_scale
    lat_scale = (screen_height-10) / \
        abs(corner1_lat - corner2_lat)
    lon_scale = (screen_width-30) / abs(corner1_lon - corner4_lon)

    home_lat, home_lon = 7.5783, 108.8694   # 7° 34' 42", 108° 52' 10"
    home_x = int((home_lon - corner1_lon) * lon_scale)
    home_y = int((corner1_lat - home_lat) * lat_scale)
    return home_x, home_y, lon_scale, lat_scale


def draw_circle_900():
    global home_x, home_y, circle_900, screen_height, screen_width
    define_home()
    R900_x = screen_width*900/2400/1.11
    R900_y = screen_height*900/1500
    circle_900 = cav.create_oval(home_x-R900_x, home_y-R900_y, home_x+R900_x, home_y+R900_y,
                                 outline="green", width=3, dash=(4, 4))


def clear_circle_900():
    cav.delete(circle_900)


def toggle_circle_900():
    if check_var_900.get() == 1:
        draw_circle_900()
    else:
        clear_circle_900()


def draw_circle_600():
    global home_x, home_y, circle_600, screen_height, screen_width
    define_home()
    R600_x = screen_width*600/2400/1.11
    R600_y = screen_height*600/1500
    circle_600 = cav.create_oval(home_x-R600_x, home_y-R600_y, home_x+R600_x, home_y+R600_y,
                                 outline="yellow", width=3, dash=(2, 2))


def clear_circle_600():
    cav.delete(circle_600)


def toggle_circle_600():
    if check_var_600.get() == 1:
        draw_circle_600()
    else:
        clear_circle_600()


def draw_circle_300():
    global home_x, home_y, circle_300, screen_height, screen_width
    define_home()
    R300_x = screen_width*300/2400/1.11
    R300_y = screen_height*300/1500
    circle_300 = cav.create_oval(home_x-R300_x, home_y-R300_y, home_x+R300_x, home_y+R300_y,
                                 outline="red", width=1)


def clear_circle_300():
    cav.delete(circle_300)


def toggle_circle_300():
    if check_var_300.get() == 1:
        draw_circle_300()
    else:
        clear_circle_300()


class StormRotating(object):
    def __init__(self, master, filename, canvas, locations, sound_file):
        self.master = master
        self.filename = filename
        self.canvas = canvas
        self.locations = locations
        self.current_location = 0
        self.sound_file = sound_file

        self.update = self.draw().__next__
        self.update_sound = self.play_sound().__next__

        master.after(10, self.update)  # Start animation
        master.after(5, self.update_sound)  # Start sound

    def draw(self):
        image = Image.open(self.filename)
        image = image.resize((50, 50), Image.LANCZOS)
        angle = 0

        while self.current_location < len(self.locations) - 1:
            x1, y1 = self.locations[self.current_location]
            x2, y2 = self.locations[self.current_location + 1]

            # Calculate the distance between (x1, y1) and (x2, y2)
            distance = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5
            # Calculate the number of steps for the animation
            num_steps = int(distance)  # Adjust this as needed
            if num_steps == 0:
                num_steps = 1  # Ensure at least one step

            x_step = (x2 - x1) / num_steps
            y_step = (y2 - y1) / num_steps
            angle_step = 7

            x, y = x1, y1

            for step in range(num_steps):
                x += x_step
                y += y_step
                tkimage = ImageTk.PhotoImage(image.rotate(angle))

                canvas_obj = self.canvas.create_image(x, y, image=tkimage)
                self.master.after(50, self.update)
                yield
                self.canvas.delete(canvas_obj)
                angle += angle_step
                angle %= 360

                # time.sleep(0.01)
            # Move to the next location in the tuple
            self.current_location += 1
        # Animation is finished, stop the sound
        pygame.mixer.music.stop()

    def play_sound(self):
        pygame.mixer.init()
        pygame.mixer.music.load(self.sound_file)
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(20)
            yield  # Pause briefly

    def animate_2(self):
        self.play_sound()
        self.update = self.draw().__next__
        self.master.after(100, self.update)


def animation():
    global Locations, storm_animation, play_sound
    storm_animation = StormRotating(
        root, storm_image_path, cav, Locations, sound_path)


def calculate_distance(lat1, lon1, lat2, lon2):
    # Haversine formula for calculating the distance between two GPS coordinates
    R = 6371.0  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = math.sin(d_lat / 2) ** 2 + math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = (R * c)/1.852
    return distance


def add_storm_location():
    global storm_locations
    try:
        lat = float(lat_entry.get())
        lon = float(lon_entry.get())
        storm_locations.append((lat, lon))
    except ValueError:
        messagebox.showerror(
            "Error", "Please enter valid numerical values for latitude and longitude.")


def track_typhoon():

    global storm_icon, tracking_counter, lt_text_1, lt_text_2, Locations, Tp, distance_to_home
    global result_label, Tp_label, storm_name_label, warning_label, storm_list_box, home_x, home_y, lt_wind_speed_text, lt_wind_gust_text

    try:
        # Get user input data
        storm_name_get = storm_entry.get()
        date_get = date_entry.get()
        time_get = time_entry.get()
        wind_speed = float(wind_speed_entry.get())
        wind_gust = float(wind_gust_entry.get())
        lat = float(lat_entry.get())
        lon = float(lon_entry.get())
        moving_speed = float(moving_speed_entry.get())
        moving_direction = moving_direction_entry.get().upper()
        lt_wind_speed = float(lt_wind_speed_entry.get())
        lt_wind_gust = float(lt_wind_gust_entry.get())

        # Add typhoon data to the previous_typhoon_data list
        previous_typhoon_data.append(
            (lat, lon, wind_speed, wind_gust, moving_speed, moving_direction))
        # Update the storm list box to show previous typhoon data
        storm_list_box.insert(
            tk.END, f"{date_get}, {time_get}: W.Speed: {wind_speed}, W.Gust: {wind_gust},\n M.Speed: {moving_speed}, M.Direction: {moving_direction}")

        # Show the storm icon on the background based on the input latitude & longitude:
        show_storm_icon()

        # Calculate estimated time and distance from typhoon to dedicated home point (assuming home point GPS coordinates are known)
        home_lat, home_lon = 7.5783, 108.8694  # Home point coordinates
        distance_to_home = calculate_distance(lat, lon, home_lat, home_lon)
        estimated_time_to_home = distance_to_home / moving_speed
        if distance_to_home > 100:
            Tp = (distance_to_home - 100) / moving_speed
        else:
            Tp = 0

        # Determine the approaching route of the typhoon based on moving direction
        if lat > home_lat and lon > home_lon:
            approach_direction = "North East"
        elif lat == home_lat and lon > home_lon:
            approach_direction = "East"
        elif lat > home_lat and lon == home_lon:
            approach_direction = "North"
        elif lat < home_lat and lon < home_lon:
            approach_direction = "South West"
        elif lat == home_lat and lon < home_lon:
            approach_direction = "West"
        elif lat < home_lat and lon == home_lon:
            approach_direction = "South"
        elif lat < home_lat and lon > home_lon:
            approach_direction = "South East"
        elif lat > home_lat and lon < home_lon:
            approach_direction = "North West"
        else:
            approach_direction = "South East"

        # Show the estimated time and direction for the typhoon to reach the dedicated home point, storm name & wind speed:
        if lon - home_lon > -1:
            # Provide options for users to note what to do in each condition of the typhoon
            if lt_wind_speed >= 55 or lt_wind_gust >= 64:
                result_label.config(bg=GEM, padx=10, pady=10,
                                    text=f"Estimated distance to Lan Tay: {distance_to_home:.2f} NM\nApproaching from: {approach_direction}\nAt Lan Tay: Extremely high wave & strong wind.\nStay indoors and take necessary precautions.\nHelicopter may not available at this weather condition.", font=("Arial", 14))
            elif lt_wind_speed >= 48 and lt_wind_gust >= 48:
                result_label.config(bg=GEM, padx=10, pady=10,
                                    text=f"Estimated distance to Lan Tay: {distance_to_home:.2f} NM\nApproaching from: {approach_direction}\nAt Lan Tay: Super high wave & strong wind.\nBe cautious and avoid going outside.", font=("Arial", 14))

            elif lt_wind_speed >= 34 and lt_wind_gust >= 34:
                result_label.config(bg=GEM, padx=10, pady=10,
                                    text=f"Estimated distance to Lan Tay: {distance_to_home:.2f} NM\nApproaching from: {approach_direction}\nAt Lan Tay: Significant high wave & strong wind.\nSecure outdoor objects and be prepared.", font=("Arial", 14))
            elif lt_wind_speed >= 17 and lt_wind_gust >= 17:
                result_label.config(bg=GEM, padx=10, pady=10,
                                    text=f"Estimated distance to Lan Tay: {distance_to_home:.2f} NM\nApproaching from: {approach_direction}\nAt Lan Tay: High wave & strong wind.\nBe careful when working outside.", font=("Arial", 14))
            else:
                result_label.config(bg=GEM, padx=10, pady=10,
                                    text=f"Estimated distance to Lan Tay: {distance_to_home:.2f} NM\nApproaching from: {approach_direction}\nAt Lan Tay: No adverse weather.\nBe vigilant and stay informed.", font=("Arial", 14))
            if Tp > 0:
                Tp_label.config(
                    bg='white', text=f"Predicted time to Lan Tay\nTp = {Tp:.2f} hours\n{math.floor(Tp/24)} day(s), {Tp%24:.2f} hour(s)", fg='red', font=('Arial', 16, "bold"), padx=20, pady=20)
            else:
                Tp_label.config(
                    bg='white', text=f"Typhoon/Storm is surrounding Lan Tay\nTp = {Tp:.2f} hours", fg='red', font=('Arial', 16, "bold"), padx=20, pady=20)
        else:

            if lt_wind_speed >= 55 or lt_wind_gust >= 55:
                result_label.config(bg=GEM, padx=10, pady=10,
                                    text=f"Storm has passed our platform\nEstimated distance: {distance_to_home:.2f} NM\nAt Lan Tay: Extremely high wave & strong wind.\nStay indoors and take necessary precautions.\nHelicopter may not available at this weather condition.", font=("Arial", 14))
            elif lt_wind_speed >= 48 and lt_wind_gust >= 48:
                result_label.config(bg=GEM, padx=10, pady=10,
                                    text=f"Storm has passed our platform\nEstimated distance: {distance_to_home:.2f} NM\nAt Lan Tay: Super high wave & strong wind.\nBe cautious and avoid going outside.", font=("Arial", 14))

            elif lt_wind_speed >= 34 and lt_wind_gust >= 34:
                result_label.config(bg=GEM, padx=10, pady=10,
                                    text=f"Storm has passed our platform\nEstimated distance: {distance_to_home:.2f} NM\nAt Lan Tay: Significant high wave & strong wind.\nSecure outdoor objects and be prepared.", font=("Arial", 14))
            elif lt_wind_speed >= 17 and lt_wind_gust >= 17:
                result_label.config(bg=GEM, padx=10, pady=10,
                                    text=f"Storm has passed our platform\nEstimated distance: {distance_to_home:.2f} NM\nAt Lan Tay: High wave & strong wind.\nBe careful when working outside.", font=("Arial", 14))
            else:
                result_label.config(bg=GEM, padx=10, pady=10,
                                    text=f"Storm has passed our platform\nEstimated distance: {distance_to_home:.2f} NM\nAtnLan Tay: No adverse weather.\nBe vigilant and stay informed.", font=("Arial", 14))
            Tp_label.config(bg='white', text="Typhoon/Storm has passed Lan Tay platform",
                            fg='red', font=("Arial", 16, "bold"), padx=20, pady=20)
        define_home()
        result_label.place(x=home_x+30, y=screen_height -
                           60, anchor=tk.CENTER)
        Tp_label.place(x=10, y=10, anchor='nw')

        # Indicate LT wind speed & LT wind gust:
        if tracking_counter == 0:
            lt_wind_speed_text = f"{lt_wind_speed} kts"
            lt_text_1 = cav.create_text(home_x+45, home_y+8, text=lt_wind_speed_text,
                                        fill="black", font=("Arial", 10))

            if lt_wind_speed > 55:
                cav.itemconfig(lt_text_1,
                               fill="red", font=("Arial", 11))
            else:
                cav.itemconfig(lt_text_1,
                               fill="black", font=("Arial", 10))

        else:
            cav.delete(lt_text_1)
            lt_wind_speed_text = f"{lt_wind_speed} kts"
            lt_text_1 = cav.create_text(home_x+45, home_y+8, text=lt_wind_speed_text,
                                        fill="black", font=("Arial", 10))
            if lt_wind_speed > 55:
                cav.itemconfig(lt_text_1,
                               fill="red", font=("Arial", 11))
            else:
                cav.itemconfig(lt_text_1,
                               fill="black", font=("Arial", 10))

        if tracking_counter == 0:
            lt_wind_gust_text = f"{lt_wind_gust} kts"
            lt_text_2 = cav.create_text(home_x+45, home_y-12, text=lt_wind_gust_text,
                                        fill="black", font=("Arial", 10))

            if lt_wind_gust > 55:
                cav.itemconfig(lt_text_2,
                               fill="red", font=("Arial", 11))
            else:
                cav.itemconfig(lt_text_2,
                               fill="black", font=("Arial", 10))

        else:
            cav.delete(lt_text_2)
            lt_wind_gust_text = f"{lt_wind_gust} kts"
            lt_text_2 = cav.create_text(home_x+45, home_y-12, text=lt_wind_gust_text,
                                        fill="black", font=("Arial", 10))

            if lt_wind_gust > 55:
                cav.itemconfig(lt_text_2,
                               fill="red", font=("Arial", 11))
            else:
                cav.itemconfig(lt_text_2,
                               fill="black", font=("Arial", 10))

        cav.create_text(rel_x, rel_y - 33,
                        text=f"{storm_name_get}, on {date_get}, at {time_get}", fill="yellow")
        storm_name_label.config(
            bg=ORANGE, text=f"{storm_name_get}, on {date_get} at {time_get}", font=("Arial", 12, "bold"))
        storm_name_label.place(x=rel_x, y=rel_y-38, anchor=tk.CENTER)
        if wind_speed < 64:
            cav.create_text(rel_x+36, rel_y+15,
                            text=f"{wind_speed} kts", fill="black", font=("Arial", 10))
        else:
            cav.create_text(rel_x+36, rel_y+15,
                            text=f"{wind_speed} kts", fill="red", font=("Arial", 10))
        if wind_gust < 64:
            cav.create_text(
                rel_x+38, rel_y-8, text=f"{wind_gust} kts", fill="black", font=("Arial", 10))
        else:
            cav.create_text(
                rel_x+38, rel_y-8, text=f"{wind_gust} kts", fill="red", font=("Arial", 10))

        # Provide options for users to note what to do in each condition of the typhoon
        if wind_speed >= 64:
            messagebox.showwarning(
                "Warning", "Condition: TYPHOON!!!\nSee the wind scale list or illustration video for more information.")

            if distance_to_home <= 300:
                warning_label.config(
                    bg="red", text="CAUTIONS - TYPHOON!\nThe Typhoon is within 300NM of the Lan Tay platform - CODE RED\n\nActions to be done: See Checklist for RED zone.", foreground="white", font=("Arial", 14), padx=20, pady=20)
            elif distance_to_home <= 600:
                warning_label.config(
                    bg="yellow", text="CAUTIONS - TYPHOON!\nThe Typhoon is within 600NM of the Lan Tay Platform - CODE YELLOW\n\nActions to be done: See Checklist for YELLOW zone.", foreground="black", font=("Arial", 14), padx=20, pady=20)
            elif distance_to_home <= 900:
                warning_label.config(
                    bg="green", text="CAUTIONS - TYPHOON!\nThe Typhoon is within 900NM of the Lan Tay Platform - CODE GREEN\n\nActions to be done: See Checklist for GREEN zone.", foreground="white", font=("Arial", 14), padx=20, pady=20)
            else:
                warning_label.config(
                    bg="white", text="INFO\nThe Typhoon is not in 900NM of the Lan Tay platform. Be vigilant and stay informed.", font=("Arial", 14))
            warning_label.place(x=screen_width/2, y=66,
                                anchor=tk.CENTER)

        elif wind_speed >= 48:
            messagebox.showwarning(
                "Warning", "Condition: SEVERE TROPICAL STORM!\nSee the wind scale list or illustration video for more information.")

            if distance_to_home <= 300:
                warning_label.config(
                    bg="red", padx=20, pady=20, text="CAUTIONS - SEVERE TROPICAL STORM!\nThe storm is within 300NM of the Lan Tay platform - CODE RED\n\n Actions to be done: See Checklist for RED zone.", foreground="white", font=("Arial", 14))
            elif distance_to_home <= 600:
                warning_label.config(
                    bg="yellow", padx=20, pady=20, text="CAUTIONS - SEVERE TROPICAL STORM!\nThe storm is within 600NM of the Lan Tay Platform - CODE YELLOW\n\nActions to be done: See Checklist for YELLOW zone.", foreground="black", font=("Arial", 14))
            elif distance_to_home <= 900:
                warning_label.config(
                    bg="green", padx=20, pady=20, text="CAUTIONS - SEVERE TROPICAL STORM!\nThe storm is within 900NM of the Lan Tay Platform - CODE GREEN\n\nActions to be done: See Checklist for GREEN zone.", foreground="white", font=("Arial", 14))
            else:
                warning_label.config(
                    bg="white", padx=20, pady=20, text="INFO\nThe storm is not in 900NM of the Lan Tay platform. Be vigilant and stay informed.", font=("Arial", 14))
            warning_label.place(x=screen_width/2, y=66,
                                anchor=tk.CENTER)

        elif wind_speed >= 34:
            messagebox.showwarning(
                "Warning", "Condition: TROPICAL STORM!\nSee the wind scale list or illustration video for more information.")

            if distance_to_home <= 300:
                warning_label.config(
                    bg="red", padx=20, pady=20, text="CAUTIONS - TROPICAL STORM!\nThe storm is within 300NM of the Lan Tay platform - CODE RED\n\nActions to be done: See Checklist for RED zone.", foreground="white", font=("Arial", 14))
            elif distance_to_home <= 600:
                warning_label.config(
                    bg="yellow", padx=20, pady=20, text="CAUTIONS - TROPICAL STORM!\nThe storm is within 600NM of the Lan Tay Platform - CODE YELLOW\n\nActions to be done: See Checklist for YELLOW zone.", foreground="black", font=("Arial", 14))
            elif distance_to_home <= 900:
                warning_label.config(
                    bg="green", padx=20, pady=20, text="CAUTIONS - TROPICAL STORM!\nThe storm is within 900NM of the Lan Tay Platform - CODE GREEN\n\nActions to be done: See Checklist for GREEN zone.", foreground="white", font=("Arial", 14))
            else:
                warning_label.config(
                    bg="white", padx=20, pady=20, text="INFO - TROPICAL STORM\nThe storm is not in 900NM of the Lan Tay platform. Be vigilant and stay informed.", font=("Arial", 14))
            warning_label.place(x=screen_width/2, y=66,
                                anchor=tk.CENTER)

        elif wind_speed >= 17:
            messagebox.showinfo(
                "Info", "Condition: TROPICAL DEPRESSION!\nSee the wind scale list or illustration video for more information.")
        else:
            messagebox.showinfo(
                "Info", "Condition: The sea weather condition is FAIR. Be vigilant and stay informed.")

    except ValueError:
        messagebox.showinfo(
            "Cautions", "Please enter valid numerical values for all input fields.")

    # draw a line from previous location to current location:
    L = len(Locations)-1
    a1, b1 = Locations[L-1]
    a2, b2 = Locations[L]
    print(a1, b1, a2, b2)
    cav.create_line(a1, b1, a2, b2, fill="yellow", width=1, dash=(1, 1))

    tracking_counter += 1


def update_storm_icons():
    # delete old icons:
    # cav.delete(storm_icon)
    global rel_x, rel_y, rel_ang, storm_conditions, resize_icon_arrow, Locations, location_tuple_2, screen_height, screen_width, lon_scale, lat_scale, corner1_lon, corner1_lat, corner3_lon, corner3_lat
    lat = float(lat_entry.get())
    lon = float(lon_entry.get())
    direction = moving_direction_entry.get().upper()
    location_tuple = [lat, lon, direction]
    storm_conditions.append(location_tuple)
    define_home()

    for inner_list in storm_conditions:
        # Calculate relative position within the background
        rel_lat = lat
        rel_lon = lon
        rel_x = int((rel_lon - corner1_lon) * lon_scale)+10
        rel_y = int((corner1_lat - rel_lat) * lat_scale)+10
        location_tuple_2 = [rel_x, rel_y]
        # Add typhoon data to Locations tuple
        Locations.append(location_tuple_2)

        # Remove all the same values in Locations tuple:
        def remove_duplicates(test_tuple):
            res = []
            for i in test_tuple:
                if i not in res:
                    res.append(i)
            return res
        Locations = remove_duplicates(Locations)

        if direction == "N":
            arrow_path = 'C:\Storm_tracker_data\Storm moving direction/N.png'
        elif direction == "S":
            arrow_path = 'C:\Storm_tracker_data\Storm moving direction/S.png'
        elif direction == "E":
            arrow_path = 'C:\Storm_tracker_data\Storm moving direction/E.png'
        elif direction == "W":
            arrow_path = 'C:\Storm_tracker_data\Storm moving direction/W.png'
        elif direction == "NE":
            arrow_path = 'C:\Storm_tracker_data\Storm moving direction/NE.png'
        elif direction == "NW":
            arrow_path = 'C:\Storm_tracker_data\Storm moving direction/NW.png'
        elif direction == "SE":
            arrow_path = 'C:\Storm_tracker_data\Storm moving direction/SE.png'
        elif direction == "SW":
            arrow_path = 'C:\Storm_tracker_data\Storm moving direction/SW.png'
        elif direction == "NNE":
            arrow_path = 'C:\Storm_tracker_data\Storm moving direction/NNE.png'
        elif direction == "NNW":
            arrow_path = 'C:\Storm_tracker_data\Storm moving direction/NNW.png'
        elif direction == "ENE":
            arrow_path = 'C:\Storm_tracker_data\Storm moving direction/ENE.png'
        elif direction == "WNW":
            arrow_path = 'C:\Storm_tracker_data\Storm moving direction/WNW.png'
        elif direction == "ESE":
            arrow_path = 'C:\Storm_tracker_data\Storm moving direction/ESE.png'
        elif direction == "WSW":
            arrow_path = 'C:\Storm_tracker_data\Storm moving direction/WSW.png'
        elif direction == "SSE":
            arrow_path = 'C:\Storm_tracker_data\Storm moving direction/SSE.png'
        elif direction == "SSW":
            arrow_path = 'C:\Storm_tracker_data\Storm moving direction/SSW.png'
        else:
            messagebox.showinfo(
                "Cautions", "Please enter a valid moving direction")
        arrow_img = Image.open(arrow_path)
        arrow_img = arrow_img.resize((75, 75), Image.LANCZOS)
        resize_icon_arrow = ImageTk.PhotoImage(arrow_img)

        # Create arrow & storm:
        cav.create_image(
            rel_x, rel_y, image=resize_icon_arrow, anchor="center")
        cav.create_image(rel_x, rel_y, image=storm_icon, anchor="center")


def show_storm_icon():
    update_storm_icons()


# Create a function to show the actions to be done and change the background color of an action when its checkbox is ticked:

def show_checklist_red():
    # Create a new toplevel window
    checklist_red_window = tk.Toplevel(bg="white")
    checklist_red_window.title("Checklist for Red Zone")
    checklist_red_window.geometry('980x480+480+10')

    # Define the checklist items
    checklist_red_items = [
        "1 - Track the progression of the Typhoon",
        "\n2 - Lan Tay ERT to tour the platform and ensure that all equipment is secured",
        "\n3 - IM to inform offshore operations and onshore support teams of decision to evacuate the Lan Tay Platform",
        "\n4 - Confirm that the RACON Beacon is working (range 25 NM)",
        "\n5 - Switch on the Platform Navigation Aids",
        "\n6 - Ensure that SBV is Tracking all Vessel movements with the ARPA System",
        "\n7 - Activate Helicopter support via the Vung Tau Supply Base",
        "\n8 - Consider to evacuate all remaining platform personnel to a place of safety (Flight No. 2 & 3)."
    ]

    CHECKBOX_RED_STATES = [tk.BooleanVar() for _ in checklist_red_items]

    def play_ting_sound():
        pygame.mixer.init()
        pygame.mixer.music.load(ting_sound)
        pygame.mixer.music.play()

    # Create a list to hold the checkboxes

    def update_action_red_bg(index):
        if CHECKBOX_RED_STATES[index].get():
            action_red_labels[index].config(bg="green")
            play_ting_sound()
        else:
            action_red_labels[index].config(bg="white")

    # Create a list of action labels with corresponding check boxes
    red_zone_label = Label(checklist_red_window, text="Checklist for RED zone",
                           bg='red', fg='white', font=("Arial", 16, "bold"))
    red_zone_label.pack()
    red_zone_sub_label = Label(checklist_red_window, text="\nACTIONS TO BE DONE",
                               bg='white', fg='black', font=("Arial", 12, "bold"))
    red_zone_sub_label.pack()

    red_zone_frame = tk.Frame(checklist_red_window, bg="white", width=900,
                              height=250, relief="groove", bd=2)
    red_zone_frame.pack()

    action_red_labels = []
    for i, action in enumerate(checklist_red_items):
        label = Label(red_zone_frame, text=action,
                      bg="white", font='Arial 14', anchor='w')
        label.grid(row=i, column=0, sticky="w")
        checkbox = tk.Checkbutton(
            red_zone_frame, variable=CHECKBOX_RED_STATES[i], command=lambda index=i: update_action_red_bg(index), bg="white")
        checkbox.grid(row=i, column=1)
        action_red_labels.append(label)


def show_checklist_yellow():
    # Create a new toplevel window
    checklist_yellow_window = tk.Toplevel(bg="white")
    checklist_yellow_window.title("Checklist for Yellow Zone")
    checklist_yellow_window.geometry('980x420+480+10')

    # Define the checklist items
    checklist_yellow_items = [
        "\n1 - Track the progression of the Typhoon/Storm",
        "\n2 - Bring forward and complete all critical work on the Lan Tay Platform",
        "\n3 - Liaise with onshore support teams and request that Helicopters are put on standby",
        "\n4 - IM to inform offshore operations and onshore support teams of \nthe decision to down-man all non-essential personnel",
        "\n5 - Activate Helicopter support via the Vung Tau Supply Base",
        "\n6 – Consider to down-man all non-essential personnel to a place of safety (Flight No.1)."
    ]

    CHECKBOX_YELLOW_STATES = [tk.BooleanVar() for _ in checklist_yellow_items]

    def play_ting_sound_2():
        pygame.mixer.init()
        pygame.mixer.music.load(ting_sound)
        pygame.mixer.music.play()
    # Create a list to hold the checkboxes

    def update_action_yellow_bg(index):
        if CHECKBOX_YELLOW_STATES[index].get():
            action_yellow_labels[index].config(bg="green")
            play_ting_sound_2()
        else:
            action_yellow_labels[index].config(bg="white")

    # Create a list of action labels with corresponding check boxes
    yellow_zone_label = Label(checklist_yellow_window, text="Checklist for YELLOW zone",
                              bg='yellow', fg='black', font=("Arial", 16, "bold"))
    yellow_zone_label.pack()
    yellow_zone_sub_label = Label(checklist_yellow_window, text="\nACTIONS TO BE DONE\n",
                                  bg='white', fg='black', font=("Arial", 12, "bold"))
    yellow_zone_sub_label.pack()

    yellow_zone_frame = tk.Frame(checklist_yellow_window, bg="white", width=900,
                                 height=250, relief="groove", bd=2)
    yellow_zone_frame.pack()

    action_yellow_labels = []
    for i, action in enumerate(checklist_yellow_items):
        label = Label(yellow_zone_frame, text=action,
                      bg="white", font='Arial 14', anchor='w')
        label.grid(row=i, column=0, sticky="w")
        checkbox = tk.Checkbutton(
            yellow_zone_frame, variable=CHECKBOX_YELLOW_STATES[i], command=lambda index=i: update_action_yellow_bg(index), bg="white")
        checkbox.grid(row=i, column=1)
        action_yellow_labels.append(label)


def show_checklist_green():
    # Create a new toplevel window
    checklist_green_window = tk.Toplevel(bg="white")
    checklist_green_window.title("Checklist for Green Zone")
    checklist_green_window.geometry('980x280+480+10')

    # Define the checklist items
    checklist_green_items = [
        "\n1 - IM to monitor the situation and give regular updates",
        "\n2 - Obtain all relevant data/information regarding the direction and wind speed of the Typhoon/Storm",
        "\n3 - Prepare for potential evacuation plans for all non-essential and essential personnel.",
    ]

    CHECKBOX_GREEN_STATES = [tk.BooleanVar() for _ in checklist_green_items]

    def play_ting_sound_3():
        pygame.mixer.init()
        pygame.mixer.music.load(ting_sound)
        pygame.mixer.music.play()

    # Create a list to hold the checkboxes

    def update_action_green_bg(index):
        if CHECKBOX_GREEN_STATES[index].get():
            action_green_labels[index].config(bg="green")
            play_ting_sound_3()
        else:
            action_green_labels[index].config(bg="white")

    # Create a list of action labels with corresponding check boxes
    green_zone_label = Label(checklist_green_window, text="Checklist for GREEN zone",
                             bg='green', fg='white', font=("Arial", 16, "bold"))
    green_zone_label.pack()
    green_zone_sub_label = Label(checklist_green_window, text="\nACTIONS TO BE DONE\n",
                                 bg='white', fg='black', font=("Arial", 12, "bold"))
    green_zone_sub_label.pack()

    green_zone_frame = tk.Frame(checklist_green_window, bg="white", width=900,
                                height=250, relief="groove", bd=2)
    green_zone_frame.pack()

    action_green_labels = []
    for i, action in enumerate(checklist_green_items):
        label = Label(green_zone_frame, text=action,
                      bg="white", font='Arial 14', anchor='w')
        label.grid(row=i, column=0, sticky="w")
        checkbox = tk.Checkbutton(
            green_zone_frame, variable=CHECKBOX_GREEN_STATES[i], command=lambda index=i: update_action_green_bg(index), bg="white")
        checkbox.grid(row=i, column=1)
        action_green_labels.append(label)


# Create a function to save the inputted data to an Excel file:

def save_data():
    global storm_name, date, time, lat, lon, wind_speed, wind_gust, moving_speed, moving_direction, lt_wind_speed, lt_wind_gust, Tp, distance_to_home
    storm_name = storm_entry.get()
    date = date_entry.get()
    time = time_entry.get()
    lat = lat_entry.get()
    lon = lon_entry.get()
    wind_speed = wind_speed_entry.get()
    wind_gust = wind_gust_entry.get()
    moving_speed = moving_speed_entry.get()
    moving_direction = moving_direction_entry.get().upper()
    lt_wind_speed = lt_wind_speed_entry.get()
    lt_wind_gust = lt_wind_gust_entry.get()
    Tp_save = "{:.2f}".format(Tp)
    distance_to_lt = "{:.2f}".format(distance_to_home)

    # Load the existing Excel file

    workbook = load_workbook(filepath)
    worksheet = workbook.active
    worksheet.append([storm_name, date, time, lat, lon, wind_speed, wind_gust, moving_speed, moving_direction,
                      lt_wind_speed, lt_wind_gust, Tp_save, distance_to_lt])  # Append row to the Excel file

    # Save the changes to the Excel file
    workbook.save(filepath)

# Create Reset function to clear all data in storm_list_box and storm_conditions:


def reset():
    global storm_conditions, Locations, storm_list_box, warning_label, background_image_2, check_var_900, check_var_600, check_var_300, resize_LTP, LTP_image, home_x, home_y, screen_height, screen_width
    confirmed = messagebox.askyesno(
        "Confirm Reset", "Are you sure you want to clear all input data?")
    if confirmed:
        storm_conditions = []
        Locations = []
        storm_list_box.delete(0, tk.END)
        cav.delete("all")
        result_label.config(text="")
        Tp_label.config(text="")
        storm_name_label.config(text="")
        warning_label.config(text="")
        # wind_scale_label.config(text="", anchor='se')
        # lt_wind_speed_label.config(text="")
        # lt_wind_gust_label.config(text="")
        result_windspeed.config(text="")

        storm_name_label.config(bg="white")
        result_label.config(bg="white")
        Tp_label.config(bg="white")
        warning_label.config(bg="white")
        # wind_scale_label.config(bg="red")
        result_windspeed.config(bg="white")
        storm_name_label.place(x=screen_width, y=screen_height, anchor='nw')
        result_label.place(x=screen_width, y=screen_height, anchor='nw')
        Tp_label.place(x=screen_width, y=screen_height, anchor='nw')
        warning_label.place(x=screen_width, y=screen_height, anchor='nw')
        # wind_scale_label.place(x=0, y=0)
        result_windspeed.place(x=screen_width, y=screen_height, anchor='nw')

        storm_entry.delete(0, tk.END)
        date_entry.delete(0, tk.END)
        time_entry.delete(0, tk.END)
        lat_entry.delete(0, tk.END)
        lon_entry.delete(0, tk.END)
        wind_speed_entry.delete(0, tk.END)
        wind_gust_entry.delete(0, tk.END)
        moving_speed_entry.delete(0, tk.END)
        moving_direction_entry.delete(0, tk.END)
        lt_wind_speed_entry.delete(0, tk.END)
        lt_wind_gust_entry.delete(0, tk.END)

        cav.create_image(0, 0, image=background_image_2, anchor='nw')

        # Indicate LTP image at (home_x, home_y) coordinate:
        define_home()
        resize_LTP = Image.open('C:\Storm_tracker_data/LTP.png')
        resize_LTP = resize_LTP.resize((150, 150), Image.LANCZOS)
        LTP_image = ImageTk.PhotoImage(resize_LTP)
        cav.create_image(home_x, home_y, image=LTP_image, anchor='center')

        cav.pack(fill=tk.BOTH, expand=True)


def minimize_root_window():
    root.iconify()


def confirm_close():
    confirmed = messagebox.askyesno(
        "Confirm Close", "Are you sure you want to close the program?")
    if confirmed:
        root.destroy()


# Create the main window
root = tk.Tk()
root.title("Typhoon Tracker Program")
root.attributes("-fullscreen", True)


screen_width = root.winfo_screenwidth()
screen_height = root.winfo_screenheight()
# screen_height = 914, screen_width = 1463

# Load and display the background image for the program

background_image = tk.PhotoImage(
    file=background_image_path)
background_label = tk.Label(root, image=background_image)
background_label.pack(fill=tk.BOTH, expand=2)
background_label.place(relx=0.5, rely=0.5, anchor=tk.CENTER)
# background_label.lower()

# Load and display the background image for the canvas:
cav = Canvas(root)

resize_img = Image.open(background_image_path)
resize_img = resize_img.resize((screen_width, screen_height), Image.LANCZOS)
background_image_2 = ImageTk.PhotoImage(resize_img)
cav.create_image(0, 0, image=background_image_2, anchor='nw')
cav.pack(fill=tk.BOTH, expand=True)


# Indicate LTP image at (home_x, home_y) coordinate:
define_home()
resize_LTP = Image.open('C:\Storm_tracker_data/LTP.png')
resize_LTP = resize_LTP.resize((150, 150), Image.LANCZOS)
LTP_image = ImageTk.PhotoImage(resize_LTP)
cav.create_image(home_x, home_y, image=LTP_image, anchor='center')


result_label = Label(root)
Tp_label = Label(root)
warning_label = Label(root)
result_windspeed = Label(root)
storm_name_label = Label(root)
# lt_wind_speed_label_2 = Label(root)
# lt_wind_gust_label_2 = Label(root)
# wind_scale_label = Label(root)


# Data input section, align the text to right
data_frame = tk.Frame(root, bg="white", width=300,
                      height=300, relief="groove", bd=2)
data_frame.place(x=5, y=400)

storm_list_label = tk.Label(
    data_frame, text="Storm conditions tracking:", bg='white', fg='#F86F03', font=("Arial", 10, "bold"))
storm_list_label.grid(row=0, column=0, padx=3, pady=3, columnspan=4)

storm_list_box = tk.Listbox(data_frame, width=70, height=9)
storm_list_box.grid(row=1, column=0, padx=5, pady=5, columnspan=4)

storm_name = Label(data_frame, text="Storm name:", justify="right", bg='white')
storm_name.grid(row=7, column=1, padx=5, pady=5)
storm_entry = Entry(data_frame, width=15)
storm_entry.grid(row=7, column=2, padx=5, pady=5)

date = Label(data_frame, text="Date (dd/mm)", justify="right", bg='white')
date.grid(row=8, column=0, padx=2, pady=5)
date_entry = Entry(data_frame, width=10)
date_entry.grid(row=8, column=1, padx=5, pady=5)

time = Label(data_frame, text="Time (hh:mm)", justify="right", bg='white')
time.grid(row=8, column=2, padx=2, pady=5)
time_entry = Entry(data_frame, width=10)
time_entry.grid(row=8, column=3, padx=5, pady=5)

lat_label = tk.Label(data_frame, text="Latitude (N)", bg='white')
lat_label.grid(row=9, column=0, padx=5, pady=5)
lat_entry = Entry(data_frame, width=10)
lat_entry.grid(row=9, column=1, padx=5, pady=5)

lon_label = tk.Label(data_frame, text="Longitude (E)", bg='white')
lon_label.grid(row=9, column=2, padx=5, pady=5)
lon_entry = Entry(data_frame, width=10)
lon_entry.grid(row=9, column=3, padx=5, pady=5)

wind_speed_label = tk.Label(data_frame, text="Wind Speed (kts)", bg='white')
wind_speed_label.grid(row=10, column=0, padx=2, pady=2)
wind_speed_entry = tk.Entry(data_frame, width=10)
wind_speed_entry.grid(row=10, column=1, padx=2, pady=2)

wind_gust_label = tk.Label(data_frame, text="Wind Gust (kts)", bg='white')
wind_gust_label.grid(row=10, column=2, padx=5, pady=5)
wind_gust_entry = tk.Entry(data_frame, width=10)
wind_gust_entry.grid(row=10, column=3, padx=5, pady=5)

moving_speed_label = tk.Label(
    data_frame, text="Moving Speed (kts)", bg='white')
moving_speed_label.grid(row=11, column=0, padx=2, pady=5)
moving_speed_entry = tk.Entry(data_frame, width=10)
moving_speed_entry.grid(row=11, column=1, padx=2, pady=5)

moving_direction_label = tk.Label(
    data_frame, text="Moving Direction", bg='white')
moving_direction_label.grid(row=11, column=2, padx=2, pady=5)
moving_direction_entry = tk.Entry(data_frame, width=10)
moving_direction_entry.grid(row=11, column=3, padx=2, pady=5)

lt_wind_speed_label = tk.Label(
    data_frame, text="LT Wind Speed (kts)", bg='white')
lt_wind_speed_label.grid(row=12, column=0, padx=2, pady=5)
lt_wind_speed_entry = tk.Entry(data_frame, width=10)
lt_wind_speed_entry.grid(row=12, column=1, padx=2, pady=5)

lt_wind_gust_label = tk.Label(
    data_frame, text="LT Wind Gust (kts)", bg='white')
lt_wind_gust_label.grid(row=12, column=2, padx=2, pady=5)
lt_wind_gust_entry = tk.Entry(data_frame, width=10)
lt_wind_gust_entry.grid(row=12, column=3, padx=2, pady=5)

# Create text variable for LT winds:
lt_wind_speed_text = tk.StringVar()
lt_wind_gust_text = tk.StringVar()

# Open then resize the storm icon:
resize_icon_img = Image.open(storm_image_path)
resize_icon_img = resize_icon_img.resize((50, 50), Image.LANCZOS)
storm_icon = ImageTk.PhotoImage(resize_icon_img)


track_button = tk.Button(
    data_frame, text="Track Storm", command=track_typhoon, width=14, bg='#FFB000')
track_button.grid(row=13, column=1, padx=5, pady=5)

reset_button = tk.Button(
    data_frame, text="Reset", command=reset, bg='green', width=14, fg='white')
reset_button.grid(row=13, column=3, padx=5, pady=5)

animation_button = tk.Button(
    data_frame, text="Storm Animation", command=animation, width=14, bg="#40F8FF")
animation_button.grid(row=14, column=1, padx=5, pady=5)

wind_scale_button = tk.Button(
    data_frame, text="Show Wind Scale", command=show_wind_scale, width=14, bg="#40F8FF")
wind_scale_button.grid(row=14, column=2, padx=5, pady=5)

explanation_button = tk.Button(
    data_frame, text="Explanation", command=show_explanation, width=14, bg="#40F8FF")
explanation_button.grid(row=14, column=3, padx=5, pady=5)

illustration_video_label = tk.Label(
    data_frame, text="Illustration video:", bg='white', fg='#5B0888')
illustration_video_label.grid(row=15, column=0, padx=5, pady=5)

video_button_1 = tk.Button(data_frame, text="Lv 01 - 07",
                           command=lambda: play_video(video_path_1), width=14, bg="#45FFCA")
video_button_1.grid(row=15, column=1, padx=5, pady=5)

video_button_2 = tk.Button(data_frame, text="Lv 08 - 11",
                           command=lambda: play_video(video_path_2), width=14, bg="#45FFCA")
video_button_2.grid(row=15, column=2, padx=5, pady=5)

video_button_3 = tk.Button(data_frame, text="Lv 12 & 12+",
                           command=lambda: play_video(video_path_3), width=14, bg="#45FFCA")
video_button_3.grid(row=15, column=3, padx=5, pady=5)


checklist_label = tk.Label(
    data_frame, text="Checklists:", bg='white', fg='#5B0888')
checklist_label.grid(row=16, column=0, padx=5, pady=5)
checklist_green_button = tk.Button(
    data_frame, text="Green", command=show_checklist_green, width=10, bg="green")
checklist_green_button.grid(row=16, column=1, padx=5, pady=5)

checklist_yellow_button = tk.Button(
    data_frame, text="Yellow", command=show_checklist_yellow, width=10, bg="yellow")
checklist_yellow_button.grid(row=16, column=2, padx=5, pady=5)

checklist_red_button = tk.Button(
    data_frame, text="Red", command=show_checklist_red, width=10, bg="red", fg="white")
checklist_red_button.grid(row=16, column=3, padx=5, pady=5)


# Create check boxes to indicate circles:
zones_label = tk.Label(data_frame, text="Zones:", bg='white', fg='#5B0888')
zones_label.grid(row=17, column=0, padx=5, pady=5)
check_var_900 = tk.IntVar()
check_var_600 = tk.IntVar()
check_var_300 = tk.IntVar()
checkbox_900 = tk.Checkbutton(
    data_frame, text="900NM", variable=check_var_900, command=toggle_circle_900, bg='white', fg="green")
checkbox_900.grid(row=17, column=1, padx=5, pady=5)
checkbox_600 = tk.Checkbutton(
    data_frame, text="600NM", variable=check_var_600, command=toggle_circle_600, bg='white', fg='#E9B824')
checkbox_600.grid(row=17, column=2, padx=5, pady=5)
checkbox_300 = tk.Checkbutton(
    data_frame, text="300NM", variable=check_var_300, command=toggle_circle_300, bg='white', fg='red')
checkbox_300.grid(row=17, column=3, padx=5, pady=5)


save_button = tk.Button(
    data_frame, text="Save Data", command=lambda: save_data(), width=14, bg='black', fg='white')
save_button.grid(row=13, column=2, padx=5, pady=5)


# Minimize root window
minimize_button = tk.Button(
    root, text="—", command=minimize_root_window, bg="white", fg="black")
minimize_button.place(x=screen_width - 48, y=5)

# Close button
close_button = tk.Button(
    root, text="X", command=confirm_close, bg="white", fg="red", font=("Arial", 9, "bold"))
close_button.place(x=screen_width - 22, y=5)


root.mainloop()
