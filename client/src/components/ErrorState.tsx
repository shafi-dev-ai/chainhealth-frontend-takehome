type ErrorStateProps = {
  message: string
  onRetry?: () => void
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="state-card error">
      <h3>Unable to load data</h3>
      <p>{message}</p>
      {onRetry ? (
        <button className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  )
}

export default ErrorState
