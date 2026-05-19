import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="fatal-screen">
          <h1>Purana</h1>
          <p>The app hit a browser error while loading.</p>
          <pre>{this.state.error.message}</pre>
          <button onClick={() => {
            localStorage.removeItem('purana-session');
            window.location.reload();
          }}>
            Reset and reload
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
