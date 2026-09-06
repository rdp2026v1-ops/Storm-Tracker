import tkinter as tk


def draw_line(canvas, x1, y1, x2, y2):
    canvas.create_line(x1, y1, x2, y2, fill="red", width=3)


# Create a Tkinter window
window = tk.Tk()

# Create a canvas
canvas = tk.Canvas(window, width=400, height=400)
canvas.pack()

# Call the draw_line function to draw the line
draw_line(canvas, 2, 4, 77, 15)

# Start the Tkinter event loop
window.mainloop()
