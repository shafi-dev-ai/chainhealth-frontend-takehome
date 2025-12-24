type LoadingStateProps = {
  label?: string
}

function LoadingState({ label = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="loading">
      <div className="spinner" />
      <span className="loading-text">{label}</span>
    </div>
  )
}

export default LoadingState
