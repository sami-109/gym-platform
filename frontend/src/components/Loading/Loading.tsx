import "./Loading.scss";

type LoadingProps = {
  message?: string;
};

function Loading({ message = "Loading..." }: LoadingProps) {
  return (
    <div className="loading">
      <div className="loading-spinner" />
      <p>{message}</p>
    </div>
  );
}

export default Loading;
