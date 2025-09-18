1. Project scaffolding & toolchain setup
1. Create a project directory:
   ```shell
   mkdir trading-animation
   cd trading-animation
   ```

2. Initialize a Git repository:
   ```shell
   git init
   ```

3. Set up package management (e.g., npm) for dependencies:
   ```shell
   npm init -y
   ```
4. Install required libraries:
   ```shell
   npm install d3 three
   ```

5. Set up your basic HTML structure with two main files:
   - `animation-1.html`
   - `animation-2.html`
2. Utility module: mock data generation + helpers
- Create a JavaScript file `data.js` for generating mock candlestick data.
- Implement functions to generate historical and current candlestick data in JSON format.
- Include utility functions for creating probabilistic predictions.
3. Animation-1 (D3.js) – core rendering
- Set up a D3.js environment for rendering candlesticks.
- Implement the historical data rendering in the left panel.
- Render the current candlestick with a pulsing effect in the middle panel.
4. Animation-1 (D3.js) – prediction animation system
- Develop a transition system for prediction scenarios in the right panel.
- Implement cycling through different scenarios (bullish, bearish, sideways).
- Use opacity transitions (15% → 0% → 15%) for prediction animation.
5. Animation-1 (Three.js) – core rendering + animation parity
- Set up a Three.js environment to mirror the D3.js setup.
- Create WebGL representations of candlesticks.
- Ensure pulsing and prediction animations are consistent with D3.js.
6. UI toggle for Animation-1 (D3 ↔ Three)
- Implement a user interface toggle to switch between D3.js and Three.js.
- Ensure the UI is intuitive and the transition is smooth.
7. Styling pass for Animation-1 (retro terminal look)
- Apply CSS to create a retro terminal appearance.
- Utilize gridlines and high-contrast colors for clarity.
8. Animation-2 (D3.js) – advanced layout & breathing present
- Design a three-panel layout: "The Immutable Past", "The Active Present", "The Evolving Future".
- Implement a breathing/pulsing effect on the current candlestick.
9. Animation-2 (D3.js) – complex future transitions
- Develop complex inter-panel transitions with dissipation effects for predictions.
- Integrate probability overlays and ghosting effects for future scenarios.
10. Animation-2 (Three.js) – WebGL counterpart
- Mirror the D3.js setup using Three.js.
- Implement similar breathing and transition effects for consistency.
11. UI toggle for Animation-2 (D3 ↔ Three)
- Include a toggle to change between D3.js and Three.js on the UI.
- Maintain consistency and fluid interaction in the toggle function.
12. Styling pass for Animation-2 (dark minimalist theme)
- Apply a professional and minimalist dark theme using CSS.
- Ensure contrast and readability for end-users.
13. Testing, performance tuning, cross-browser verification
- Test both animations on different browsers to check compatibility.
- Optimize performance, especially for transitions and toggles.
14. Documentation and inline comments
- Comment your code extensively to explain functions and logic.
- Create a README file with setup instructions and usage guides.