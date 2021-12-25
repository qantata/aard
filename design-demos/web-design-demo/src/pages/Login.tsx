import { useContext } from "react";

import { Checkbox } from "../components/Checkbox";
import { DialogConfirmButton } from "../components/Dialog";
import { Input } from "../components/Input";
import { styled } from "../stitches.config";
import LightLogoUrl from "/images/Aard-Light-Text-Full.png";
import DarkLogoUrl from "/images/Aard-Dark-Text-Full.png";
import { ThemeContext } from "../context/themeContext";

const Container = styled("div", {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: "200px",
});

const Logo = styled("div", {
  width: "150px",
  display: "flex",
  justifyContent: "center",
  marginBottom: "48px",

  "> img": {
    width: "100%",
  },
});

const LoginBox = styled("div", {
  backgroundColor: "$grayUIBg",
  padding: "64px 96px",
  borderRadius: "10px",
});

const Title = styled("h1", {
  color: "$grayTextPrimary",
  marginBottom: "32px",
  fontFamily: "$500",
});

const ButtonsContainer = styled("div", {
  display: "flex",
  marginTop: "32px",
});

const Login = () => {
  const theme = useContext(ThemeContext);

  return (
    <Container>
      <Logo>
        <img src={theme.theme === "Light" ? LightLogoUrl : DarkLogoUrl} />
      </Logo>

      <LoginBox>
        <Title>Sign in</Title>
        <Input type="text" label="Username" labelActiveBgColor={"$grayUIBg"} />
        <Input type="password" label="Password" labelActiveBgColor={"$grayUIBg"} />

        <Checkbox>Remember me</Checkbox>

        <ButtonsContainer>
          <DialogConfirmButton>Sign in</DialogConfirmButton>
        </ButtonsContainer>
      </LoginBox>
    </Container>
  );
};

export default Login;
