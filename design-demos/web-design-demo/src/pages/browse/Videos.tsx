import { styled } from "@stitches/react";
import { Image } from "lucide-react";
import { Link } from "react-router-dom";
import { ContentPageTitle } from "../../components/ContentPage";

const Container = styled("div", {
  overflowY: "scroll",
  height: "100%",
});

const Grid = styled("div", {
  width: "100%",
  height: "100%",

  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  columnGap: "24px",
  rowGap: "48px",

  "> *:last-child": {
    marginBottom: "48px",
  },
});

const VideoBlock = styled("div", {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
});

const VideoBlockThumbnail = styled("div", {
  width: "100%",
  aspectRatio: "16 / 9",
  backgroundColor: "#fff",
  borderRadius: "10px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  boxShadow: `
    2.8px 2.8px 2.2px rgba(0, 0, 0, 0.008),
    6.7px 6.7px 5.3px rgba(0, 0, 0, 0.012),
    12.5px 12.5px 10px rgba(0, 0, 0, 0.015),
    22.3px 22.3px 17.9px rgba(0, 0, 0, 0.018),
    41.8px 41.8px 33.4px rgba(0, 0, 0, 0.022),
    100px 100px 80px rgba(0, 0, 0, 0.03)
  `,

  "> img": {
    width: "100%",
    height: "100%",
    borderRadius: "10px",
  },
});

const VideoBlockTitle = styled("p", {
  cursor: "pointer",
  overflow: "hidden",
  textOverflow: "ellipsis",
  "-webkit-line-clamp": "2",
  "-webkit-box-orient": "vertical",
  display: "-webkit-box",

  "&:hover": {
    textDecoration: "underline 2px",
  },
});

const Videos = () => {
  const items = [
    {
      title: "Big Buck Bunny",
      image: "https://picsum.photos/seed/BigBuckBunny/720",
    },
    {
      title: "A Giant Christmas Tree In A Public Display In Celebration Of The Christmas Season",
      image: "https://picsum.photos/seed/ChristmasTree/720",
    },
    {
      title: "An Arena Full Of Spectators",
      image: "https://picsum.photos/seed/Arena/720",
    },
    {
      title: "A Woman Singing While Men Playing the Guitar and the Drum",
      image: "https://picsum.photos/seed/Singing/720",
    },
    {
      title: "A Video That's Missing A Thumbnail",
    },
    {
      title: "People Walking on the Street",
      image: "https://picsum.photos/seed/PeopleWalking/720",
    },
    {
      title: "Big Buck Bunny",
      image: "https://picsum.photos/seed/BigBuckBunny/720",
    },
    {
      title: "A Giant Christmas Tree In A Public Display In Celebration Of The Christmas Season",
      image: "https://picsum.photos/seed/ChristmasTree/720",
    },
    {
      title: "An Arena Full Of Spectators",
      image: "https://picsum.photos/seed/Arena/720",
    },
    {
      title: "A Woman Singing While Men Playing the Guitar and the Drum",
      image: "https://picsum.photos/seed/Singing/720",
    },
    {
      title: "A Video That's Missing A Thumbnail",
    },
    {
      title: "People Walking on the Street",
      image: "https://picsum.photos/seed/PeopleWalking/720",
    },
    {
      title: "Big Buck Bunny",
      image: "https://picsum.photos/seed/BigBuckBunny/720",
    },
    {
      title: "A Giant Christmas Tree In A Public Display In Celebration Of The Christmas Season",
      image: "https://picsum.photos/seed/ChristmasTree/720",
    },
    {
      title: "An Arena Full Of Spectators",
      image: "https://picsum.photos/seed/Arena/720",
    },
    {
      title: "A Woman Singing While Men Playing the Guitar and the Drum",
      image: "https://picsum.photos/seed/Singing/720",
    },
    {
      title: "A Video That's Missing A Thumbnail",
    },
    {
      title: "People Walking on the Street",
      image: "https://picsum.photos/seed/PeopleWalking/720",
    },
    {
      title: "Big Buck Bunny",
      image: "https://picsum.photos/seed/BigBuckBunny/720",
    },
    {
      title: "A Giant Christmas Tree In A Public Display In Celebration Of The Christmas Season",
      image: "https://picsum.photos/seed/ChristmasTree/720",
    },
    {
      title: "An Arena Full Of Spectators",
      image: "https://picsum.photos/seed/Arena/720",
    },
    {
      title: "A Woman Singing While Men Playing the Guitar and the Drum",
      image: "https://picsum.photos/seed/Singing/720",
    },
    {
      title: "A Video That's Missing A Thumbnail",
    },
    {
      title: "People Walking on the Street",
      image: "https://picsum.photos/seed/PeopleWalking/720",
    },
    {
      title: "Big Buck Bunny",
      image: "https://picsum.photos/seed/BigBuckBunny/720",
    },
    {
      title: "A Giant Christmas Tree In A Public Display In Celebration Of The Christmas Season",
      image: "https://picsum.photos/seed/ChristmasTree/720",
    },
    {
      title: "An Arena Full Of Spectators",
      image: "https://picsum.photos/seed/Arena/720",
    },
    {
      title: "A Woman Singing While Men Playing the Guitar and the Drum",
      image: "https://picsum.photos/seed/Singing/720",
    },
    {
      title: "A Video That's Missing A Thumbnail",
    },
    {
      title: "People Walking on the Street",
      image: "https://picsum.photos/seed/PeopleWalking/720",
    },
    {
      title: "Big Buck Bunny",
      image: "https://picsum.photos/seed/BigBuckBunny/720",
    },
    {
      title: "A Giant Christmas Tree In A Public Display In Celebration Of The Christmas Season",
      image: "https://picsum.photos/seed/ChristmasTree/720",
    },
    {
      title: "An Arena Full Of Spectators",
      image: "https://picsum.photos/seed/Arena/720",
    },
    {
      title: "A Woman Singing While Men Playing the Guitar and the Drum",
      image: "https://picsum.photos/seed/Singing/720",
    },
    {
      title: "A Video That's Missing A Thumbnail",
    },
    {
      title: "People Walking on the Street",
      image: "https://picsum.photos/seed/PeopleWalking/720",
    },
    {
      title: "Big Buck Bunny",
      image: "https://picsum.photos/seed/BigBuckBunny/720",
    },
    {
      title: "A Giant Christmas Tree In A Public Display In Celebration Of The Christmas Season",
      image: "https://picsum.photos/seed/ChristmasTree/720",
    },
    {
      title: "An Arena Full Of Spectators",
      image: "https://picsum.photos/seed/Arena/720",
    },
    {
      title: "A Woman Singing While Men Playing the Guitar and the Drum",
      image: "https://picsum.photos/seed/Singing/720",
    },
    {
      title: "A Video That's Missing A Thumbnail",
    },
    {
      title: "People Walking on the Street",
      image: "https://picsum.photos/seed/PeopleWalking/720",
    },
    {
      title: "Big Buck Bunny",
      image: "https://picsum.photos/seed/BigBuckBunny/720",
    },
    {
      title: "A Giant Christmas Tree In A Public Display In Celebration Of The Christmas Season",
      image: "https://picsum.photos/seed/ChristmasTree/720",
    },
    {
      title: "An Arena Full Of Spectators",
      image: "https://picsum.photos/seed/Arena/720",
    },
    {
      title: "A Woman Singing While Men Playing the Guitar and the Drum",
      image: "https://picsum.photos/seed/Singing/720",
    },
    {
      title: "A Video That's Missing A Thumbnail",
    },
    {
      title: "People Walking on the Street",
      image: "https://picsum.photos/seed/PeopleWalking/720",
    },
  ];

  return (
    <Container>
      <Grid>
        {items.map((item) => (
          <VideoBlock key={`${item.title}${Math.random()}`}>
            <Link to="/watch">
              <VideoBlockThumbnail>
                {item.image && <img src={item.image} />}
                {!item.image && <Image size={24} />}
              </VideoBlockThumbnail>
            </Link>

            <div>
              <Link to="/watch">
                <VideoBlockTitle>{item.title}</VideoBlockTitle>
              </Link>
            </div>
          </VideoBlock>
        ))}
      </Grid>
    </Container>
  );
};

export default Videos;
