import Header from "../Header";
import Footer from "../Footer";

interface  LayoutProps {
  children?: React.ReactNode;
}

function Layout(props: LayoutProps) {
  return (
    <div>
      <Header/>
      <main>{props.children}</main>
      <Footer/>
    </div>
  );
}

export default Layout