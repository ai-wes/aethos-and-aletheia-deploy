# Frontend Analysis Components

This directory contains all the components needed for the advanced frontend analysis interface as specified in the requirements.

## Components Implemented

### 1. CompassWheel Component (`CompassWheel.jsx`)

- **Purpose**: Displays an interactive D3-powered radial chart showing ethical framework weights
- **Features**:
  - Eight colored sectors representing different frameworks (Utilitarian, Deontological, etc.)
  - Animated needle pointing to the highest weight framework
  - Hover tooltips with mini sparklines showing relevance scores
  - Click handling to set active framework in OraclePanel
  - Uses framework colors from predefined palette

### 2. OraclePanel Component (`OraclePanel.jsx`)

- **Purpose**: Side panel showing detailed analysis for the selected framework
- **Features**:
  - Tab strip with unread indicators (faint glow)
  - Framework alignment progress bar with gradient styling
  - Top quotation display with metadata from sources
  - Key insights list (up to 3 items)
  - "Expand Context" button to open ReasonGraph drawer
  - Synchronized with CompassWheel via AnalysisContext

### 3. ReasonGraph Component (`ReasonGraph.jsx`)

- **Purpose**: Interactive argument flow graph using React Flow
- **Features**:
  - Dagre layout for automatic node positioning
  - Custom ArgumentNode components with citation heat overlays
  - Focus path highlighting along traced reasoning chains
  - Click-to-expand node details in side cards
  - GSAP animations on drawer open
  - Zoom controls and background grid

### 4. ReasonChain Component (`ReasonChain.jsx`)

- **Purpose**: Accordion-style breakdown of reasoning steps
- **Features**:
  - Four main sections: Scenario Analysis, Framework Evaluation, Outcome Forecast, Final Verdict
  - GSAP ScrollTrigger animations for reveal-on-scroll
  - Thumbs up/down feedback buttons in Final Verdict section
  - Parses structured response content by H3 sections
  - Key takeaways display for final section

### 5. VersionTimeline Component (`VersionTimeline.jsx`)

- **Purpose**: Shows agent evolution over time
- **Features**:
  - Recharts line chart showing performance trajectory
  - Metro-style timeline with version stops
  - Constitution diff viewer using react-diff-viewer
  - Click version to see constitutional changes highlighted
  - Performance score color coding (green/yellow/red)

### 6. LearningLoopControl Component (`LearningLoopControl.jsx`)

- **Purpose**: Control panel for running agent learning cycles
- **Features**:
  - Single button to trigger POST /api/aletheia/start_cycle
  - Loading spinner during execution
  - Success/error state handling with visual feedback
  - Toast notifications for cycle completion
  - Error handling for 405 and other HTTP errors

### 7. FeedbackSheet Component (`FeedbackSheet.jsx`)

- **Purpose**: Modal for collecting detailed user feedback
- **Features**:
  - 5-star rating system
  - Quick thumbs up/down buttons
  - Optional text feedback (500 char limit)
  - Cached response warnings for low ratings
  - QuickThumbsRating export for inline usage
  - Optimistic UI updates and submission handling

## Context and State Management

### AnalysisContext (`contexts/AnalysisContext.js`)

- Central state management for all analysis components
- Manages:
  - `analysisData`: Full query response including structured_response
  - `traceData`: Reasoning graph nodes and links
  - `activeFramework`: Currently selected framework for OraclePanel
  - `sources`: Map of source_id -> source_data for O(1) lookup
  - `isDrawerOpen`: ReasonGraph drawer visibility
  - `feedback`: User feedback state

## Main Interface Component

### AnalysisInterface (`AnalysisInterface.jsx`)

- **Purpose**: Orchestrates all analysis components into cohesive interface
- **Layout**:
  - Left: CompassWheel + LearningLoopControl + VersionTimeline
  - Center: TL;DR bar + ReasonChain
  - Right: OraclePanel
  - Overlays: ReasonGraph drawer + FeedbackSheet modal
- **Features**:
  - useQueryAnalysis hook for API integration
  - Handles trace data fetching for graph expansion
  - Manages feedback flow and component communication

## Integration with Existing Layout

To integrate with your existing Layout component:

```jsx
import AnalysisInterface from "./AnalysisInterface";
import { AnalysisProvider } from "../contexts/AnalysisContext";

// In your Layout component:
<TabsContent value="analysis">
  <AnalysisProvider>
    <AnalysisInterface
      agentId={selectedAgent?.id}
      onAgentEvolution={handleAgentEvolution}
    />
  </AnalysisProvider>
</TabsContent>;
```

## API Endpoints Required

The components expect these backend endpoints:

- `POST /api/query` - Submit ethical scenario for analysis
- `GET /api/trace/:traceId` - Get reasoning graph data
- `POST /api/feedback` - Submit user feedback
- `POST /api/aletheia/start_cycle` - Run learning cycle
- `GET /api/aletheia/history/:agentId` - Get agent version history

## Data Flow

1. User submits query via `useQueryAnalysis().executeQuery()`
2. API returns `structured_response` with frameworks, perspectives, etc.
3. `AnalysisContext.setAnalysis()` processes and stores data
4. Components reactively update based on context state
5. User interactions (compass clicks, expand context) update shared state
6. Feedback and learning cycles integrate with backend APIs

## Styling

All components use Tailwind CSS classes and are designed for dark theme. The existing App.css includes necessary custom styles for:

- React Flow overrides
- Compass wheel drop shadows
- Timeline metro stops
- Custom scrollbars
- Animation keyframes

## Dependencies

All required packages are already installed:

- `@reactflow/core` - Graph visualization
- `d3` - Compass wheel charts
- `dagre` - Graph layout
- `gsap` - Animations
- `recharts` - Performance charts
- `react-diff-viewer` - Constitution diffs
- `@headlessui/react` - Unstyled UI primitives
- `lucide-react` - Icons
