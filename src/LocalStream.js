const LocalStream = () => {
  return (
    <div className="videos">
      <span>
        <h3>Local Stream</h3>
        <video ref={webcamVideoRef} autoPlay playsInline></video>
      </span>
    </div>
  );
};

export default LocalStream;
