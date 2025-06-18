import React, { useEffect, useRef } from "react";

export default function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Array to hold all active particles
    const particles = [];

    // Configuration constants for particle behavior
    // Determines the initial horizontal position of the particle (left or right side)
    const SPAWN_X_LEFT_RATIO = 0.2;
    // Determines the initial horizontal position of the particle (left or right side)
    const SPAWN_X_RIGHT_RATIO = 0.8;
    // Determines the base vertical position for particle spawning
    const SPAWN_Y_BASE_RATIO = 0.3;
    // Determines the random vertical offset for particle spawning
    const SPAWN_Y_RANDOM_OFFSET_RATIO = 0.2;
    // Initial horizontal velocity for particles spawning from the left
    const INITIAL_VX_LEFT = 3.0;
    // Initial horizontal velocity for particles spawning from the right
    const INITIAL_VX_RIGHT = -3.0;
    // Multiplier for random vertical velocity, controlling vertical spread
    const INITIAL_VY_MULTIPLIER = 0.7;
    // Initial lifespan of a particle in seconds (increased from 2 to 4)
    const PARTICLE_LIFESPAN = 5;
    // Hue value for particles spawning from the left (e.g., gold/orange)
    const HUE_LEFT = 45;
    // Hue value for particles spawning from the right (e.g., blue/cyan)
    const HUE_RIGHT = 200;
    // Scaling factor for particle movement speed (pixels per second)
    const MOVEMENT_SPEED_SCALE = 10;
    // Radius of each particle when drawn
    const PARTICLE_RADIUS = 2;
    // Interval in milliseconds between new particle spawns (decreased from 120 to 60)
    const SPAWN_INTERVAL_MS = 120;

    function spawn() {
      // Randomly decides if the particle spawns from the left or right
      const fromLeft = Math.random() < 0.5;
      // Calculates initial x position based on `fromLeft`
      const x = fromLeft
        ? width * SPAWN_X_LEFT_RATIO
        : width * SPAWN_X_RIGHT_RATIO;
      // Calculates initial y position with a random vertical offset
      const y =
        height *
        (SPAWN_Y_BASE_RATIO + Math.random() * SPAWN_Y_RANDOM_OFFSET_RATIO);
      // Sets initial horizontal velocity based on `fromLeft`
      const vx = fromLeft ? INITIAL_VX_LEFT : INITIAL_VX_RIGHT;
      // Sets initial vertical velocity with a random component
      const vy = (Math.random() - 0.5) * INITIAL_VY_MULTIPLIER;
      // Adds a new particle object to the particles array
      particles.push({
        x,
        y,
        vx,
        vy,
        life: PARTICLE_LIFESPAN,
        hue: fromLeft ? HUE_LEFT : HUE_RIGHT,
      });
    }

    let last = performance.now();
    function step(now) {
      // Time elapsed since the last frame in seconds
      const dt = (now - last) / 1000;
      last = now;

      ctx.clearRect(0, 0, width, height);
      // Sets composite operation for blending particles, making them brighter where they overlap
      ctx.globalCompositeOperation = "lighter";

      for (let i = particles.length - 1; i >= 0; i--) {
        // Current particle being processed
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        // Updates particle's x position based on velocity and time
        p.x += p.vx * dt * MOVEMENT_SPEED_SCALE;
        // Updates particle's y position based on velocity and time
        p.y += p.vy * dt * MOVEMENT_SPEED_SCALE;
        // Calculates particle's alpha (opacity) based on its remaining life
        const alpha = p.life / PARTICLE_LIFESPAN;
        // Sets the fill style for the particle, including its hue and calculated alpha
        ctx.fillStyle = `hsla(${p.hue},100%,60%,${alpha})`;
        ctx.beginPath();
        // Draws the particle as a circle
        ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(step);
    }

    function handleResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    // Sets up an interval to continuously spawn new particles
    const spawnInterval = setInterval(spawn, SPAWN_INTERVAL_MS);
    window.addEventListener("resize", handleResize);
    requestAnimationFrame(step);

    return () => {
      clearInterval(spawnInterval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        background: "transparent",
      }}
    />
  );
}
