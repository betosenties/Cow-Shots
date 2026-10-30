"use client";

import { Component, type ReactNode } from "react";

/* If WebGL is unavailable the 3D stage fails quietly instead of taking the page down */
export default class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
