# Asteroids
A recreation of 1979's famous Asteroids game!

\>\>[**Play Here**](https://kevin-oconnor-dev.github.io/asteroids/)<<

**How to play:**
- Use the arrow keys to turn and thrust the ship
- Press the spacebar to shoot a laser
- Hold shift to slow the ship's turning rate for aiming (aim mode)

## Project Purpose and Goal
My purpose for this project was to learn about HTML Canvas and get more experience with object-oriented programming. It was my first time using canvas and also my first time developing a game. I wanted to strengthen my chops with vanilla JavaScript and get some practice with writing organized, well-structured code. As the project was my first introduction to concepts such as a game loop and drawing using geometry/trigonometry, I followed a tutorial to initially complete this project before refactoring the code and adding some features of my own, such as the ship's aiming beam and a special aiming mode for the ship to make the game a little bit more playable by modern standards.

## Technologies and Explanation
This project uses vanilla JavaScript and HTML Canvas as well as CSS and HTML. As the focus of this project was improving my skills with plain JS and getting some chops with programming logic, I didn't use a framework to develop this project.

## Problems and Thought Process
I came across a few different problems while trying to get this project working. One of the first was trying to make the ship longer than it was in the tutorial, for which I needed to try to understand the trigonometry used to draw the ship's triangular path on the canvas. Another problem I had was with positioning the game text, which I solved by using getBoundingClientRect to accurately position the "new level" and "game over" messages over the center of the canvas. I also made use of the localStorage API to keep track of the player's high score and the Sound API for sound effects.