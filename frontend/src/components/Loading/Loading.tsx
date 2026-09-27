import "./Loading.scss";
import type { LoadingProps } from "../../types/loading";

function Loading({ message = "Loading..." }: LoadingProps) {
  return (
    <div className="loading">
      <div className="loading-spinner" />
      <p>{message}</p>
    </div>
  );
}

export default Loading;
