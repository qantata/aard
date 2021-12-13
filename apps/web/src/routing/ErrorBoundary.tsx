// @ts-nocheck TODO: See maybe if these errors can be fixed

import React from "react";

/**
 * A reusable component for handling errors in a React (sub)tree.
 */
export class ErrorBoundary extends React.Component {
  state = {
    error: null,
  };

  static getDerivedStateFromError(error: any) {
    return {
      error,
    };
  }

  render() {
    if (this.state.error !== null) {
      return (
        <div>
          <div>Error: {this.state.error.message}</div>
          <div>
            <pre>{JSON.stringify(this.state.error.source, null, 2)}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
