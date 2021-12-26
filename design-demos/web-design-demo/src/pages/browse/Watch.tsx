import { VideoPlayer } from "../../components/VideoPlayer";
import { styled } from "../../stitches.config";

const Container = styled("div", {
  width: "100%",
  height: "100%",
});

const Watch = () => {
  return (
    <Container>
      <VideoPlayer />
    </Container>
  );
};

export default Watch;
