import Link from "../Link";
import styled from "styled-components";


const StyledHeader = styled.header`
  display: flex;
`


function Header() {
  return (
    <StyledHeader>
      <p>Header</p>
      <Link to="/">Home</Link>
      <Link to="/companies">Companies</Link>
    </StyledHeader>
  );
}

export default Header