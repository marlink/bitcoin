# Trading Animation Specification

## Overview
A three-panel interactive trading visualization that displays historical data, current trading activity, and animated future predictions with transitions between different scenarios.

## Panel Layout

### 1. Left Panel: Historical Daily Candlesticks
- **Visual Elements:**
  - Classic daily candlestick chart spanning several months/years
  - Fully opaque candles: green for bullish/up, red for bearish/down
  - Labeled key historical events (e.g., "Earnings Drop," "Market Rally")
  - Overlaid technical indicators: trendlines, moving averages (50-day SMA), support/resistance levels
- **Style:**
  - Retro terminal-like interface with gridlines
  - Axis labels: price on left, time on bottom

### 2. Middle Panel: Enlarged "Current" Candlestick
- **Visual Elements:**
  - Single oversized candlestick representing current day's trading (in-progress)
  - Dynamic elements:
    - Candle wicks/body flicker subtly to visualize real-time price action
    - Pulsing dot at "close" price indicating live updates
    - Volume bars at bottom changing color (blue for average, orange for spikes)
  - Annotations:
    - Horizontal lines marking key price levels (e.g., "Resistance at $150")
    - Small 1-hour timeframe chart overlay showing intraday volatility
- **Style:**
  - High-contrast colors (bright green/red)
  - Subtle shadows for depth emphasis

### 3. Right Panel: Animated Prediction Scenarios
- **Base Visual:**
  - Transparent candlestick chart (15% opacity) extending 5 days into future
- **Prediction Cycle (3-second intervals):**
  - **Prediction 1 (Bullish):**
    - Grayscale candles with upward trend
    - Light blue confidence bands widening over time
  - **Prediction 2 (Bearish):**
    - Red candles with steeper wicks showing downward trend
    - Unique confidence band pattern
  - **Prediction 3 (Sideways):**
    - Small-bodied blue candles showing lateral movement
    - Different volatility representation
- **Interactive Feature:**
  - Hover over predicted candle reveals probability data (e.g., "60% chance of closing above $150")

## Animation Sequence

1. **Initial State:**
   - Historical chart (left panel) remains static
   - Current candle (middle panel) flickers with simulated live data updates

2. **Prediction Transition Cycle:**
   - Current prediction fades out (1-second transition, opacity 15% → 0%)
   - New prediction fades in with different trend pattern
   - Each prediction displays unique characteristics:
     - Varying candle body sizes representing different volatility scenarios
     - Different trendline angles and directions
     - Confidence bands that expand/contract to show uncertainty growth

3. **Transition Effects:**
   - Slight overlap during fade transitions creating "ghosting" effect
   - Subtle "sparkle" animation suggesting AI-driven analysis

## Visual Style Guide

- **Color Scheme:**
  - Past data (left): Muted colors, gray candles, soft gridlines
  - Current data (middle): Vivid colors, neon green/red, pulsing elements
  - Future predictions (right): Ghostly whites/grays with gradient confidence bands
- **UI Elements:**
  - Sleek, minimal labels
  - Floating data tags appearing on hover
  - Clean, modern interface with high contrast for readability

## Key Conceptual Message

The animation visually demonstrates the uncertainty in market predictions while showing the relationship between historical data, current trends, and possible future scenarios. By cycling through multiple prediction models, it communicates that the future represents a probability distribution rather than a single certain outcome.
