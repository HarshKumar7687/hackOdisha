// Home.jsx
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Home = () => {
  const sectionRefs = useRef([]);

  useEffect(() => {
    // Add Remixicon CSS
    const link = document.createElement("link");
    link.href =
      "https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Add Google Fonts
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Poppins:wght@400;500;600;700&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    // Set up Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;

          if (element.classList.contains("section__subheader")) {
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
          } else if (element.classList.contains("section__header")) {
            setTimeout(() => {
              element.style.opacity = "1";
              element.style.transform = "translateY(0)";
            }, 300);
          } else if (element.classList.contains("scroll__btn")) {
            setTimeout(() => {
              element.style.opacity = "1";
              element.style.transform = "translateY(0)";
            }, 600);
          } else if (element.classList.contains("about__image")) {
            if (element.classList.contains("about__image-2") || element.classList.contains("about__image-4")) {
              element.style.opacity = "1";
              element.style.transform = "translateX(0)";
            } else {
              element.style.opacity = "1";
              element.style.transform = "translateX(0)";
            }
          } else if (element.classList.contains("about__content")) {
            const paragraphs = element.querySelectorAll("p");
            const buttons = element.querySelectorAll(".about__btn");

            setTimeout(() => {
              const subheader = element.querySelector(".section__subheader");
              if (subheader) {
                subheader.style.opacity = "1";
                subheader.style.transform = "translateY(0)";
              }
            }, 100);

            setTimeout(() => {
              const header = element.querySelector(".section__header");
              if (header) {
                header.style.opacity = "1";
                header.style.transform = "translateY(0)";
              }
            }, 300);

            setTimeout(() => {
              paragraphs.forEach((p) => {
                p.style.opacity = "1";
                p.style.transform = "translateY(0)";
              });
            }, 500);

            setTimeout(() => {
              buttons.forEach((btn) => {
                btn.style.opacity = "1";
                btn.style.transform = "translateY(0)";
              });
            }, 700);
          }
        }
      });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll(
      ".section__subheader, .section__header, .scroll__btn, .about__image, .about__content"
    );

    animatedElements.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      animatedElements.forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div className="font-['Poppins']">
      <Navbar />
      {/* Header Section */}
      <header className="header relative h-screen" id="home">
        <div className="header__bg absolute inset-0 w-full h-[calc(100%+15rem)] bg-cover bg-center bg-no-repeat z-0"></div>

        <div className="section__container header__container relative z-10 h-[calc(100%-75px)] flex items-center">
          <div className="header__content max-w-[700px] text-left ml-0 md:ml-16">
            <h3 className="section__subheader opacity-0 transform translate-y-[50px] transition-all duration-1000">
              Turning Waste into Opportunity
            </h3>
            <h1 className="section__header opacity-0 transform translate-y-[50px] transition-all duration-1000">
              BE PREPARED FOR A BETTER FUTURE.
            </h1>
            <div className="scroll__btn opacity-0 transform translate-y-[50px] transition-all duration-1000">
              <a
                href="#about"
                className="text-white hover:text-[#e9c675] transition-colors duration-300"
              >
                Scroll down
                <span>
                  <i className="ri-arrow-down-line"></i>
                </span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section className="about">
        <div className="section__container about__container">
          <div
            className="about__image about__image-1 opacity-0 transform translate-x-[50px] transition-all duration-1000"
            id="about"
          >
            <img
              src="https://images.unsplash.com/photo-1660572343425-b43aa5b13e7d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="about"
            />
          </div>

          <div className="about__content about__content-1">
            <h3 className="section__subheader opacity-0 transform translate-y-[50px] transition-all duration-1000">
              GET STARTED
            </h3>
            <h2 className="section__header opacity-0 transform translate-y-[50px] transition-all duration-1000">
              Report Waste, Earn Eco Points
            </h2>
            <p className="opacity-0 transform translate-y-[50px] transition-all duration-1000">
              See waste around you? Snap a picture, share the location, and let
              us handle the cleanup. Your contribution not only helps create a
              cleaner community but also earns you Eco Points as a reward for
              taking action towards a sustainable future.
            </p>
            <div className="about__btn opacity-0 transform translate-y-[50px] transition-all duration-1000">
              <Link to="/waste-upload" className="read-more">
                Read more
                <span>
                  <i className="ri-arrow-right-line"></i>
                </span>
              </Link>
            </div>
          </div>

          <div
            className="about__image about__image-2 opacity-0 transform -translate-x-[50px] transition-all duration-1000"
            id="equipment"
          >
            <img
              src="https://plus.unsplash.com/premium_photo-1681987448179-4a93b7975018?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmVjeWNsZXxlbnwwfHwwfHx8MA%3D%3D"
              alt="about"
            />
          </div>

          <div className="about__content about__content-2">
            <h3 className="section__subheader opacity-0 transform translate-y-[50px] transition-all duration-1000">
              LEARNING ESSENTIALS
            </h3>
            <h2 className="section__header opacity-0 transform translate-y-[50px] transition-all duration-1000">
              Learn to Reduce, Reuse & Recycle
            </h2>
            <p className="opacity-0 transform translate-y-[50px] transition-all duration-1000">
              Discover simple and effective ways to manage waste in your daily
              life. From reducing plastic use to recycling household items, our
              platform guides you with tips and resources to turn sustainable
              living into a habit. Together, we can make waste management easy
              and impactful.
            </p>
            <div className="about__btn opacity-0 transform translate-y-[50px] transition-all duration-1000">
              <Link to="/learning" className="read-more">
                Read more
                <span>
                  <i className="ri-arrow-right-line"></i>
                </span>
              </Link>
            </div>
          </div>

          <div
            className="about__image about__image-3 opacity-0 transform translate-x-[50px] transition-all duration-1000"
            id="blog"
          >
            <img
              src="https://images.unsplash.com/photo-1525695230005-efd074980869?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="about"
            />
          </div>

          <div className="about__content about__content-3">
            <h3 className="section__subheader opacity-0 transform translate-y-[50px] transition-all duration-1000">
              WHAT YOU DO IS THE KEY
            </h3>
            <h2 className="section__header opacity-0 transform translate-y-[50px] transition-all duration-1000">
              Monthly Contests
            </h2>
            <p className="opacity-0 transform translate-y-[50px] transition-all duration-1000">
              Share your recycled creations, earn eco coins, and compete for
              monthly rewards. The top-voted innovations get featured on our
              gallery — turning waste into wonder.
            </p>
            <div className="about__btn opacity-0 transform translate-y-[50px] transition-all duration-1000">
              <Link to="/social-feed" className="read-more">
                Read more
                <span>
                  <i className="ri-arrow-right-line"></i>
                </span>
              </Link>
            </div>
          </div>
          
          {/* Fourth Section - ML Waste Classification */}
          <div
            className="about__image about__image-4 opacity-0 transform -translate-x-[50px] transition-all duration-1000"
          >
            <img
              src="https://images.unsplash.com/photo-1640658541354-1175a1d7d768?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="AI Waste Classification"
            />
          </div>

          <div className="about__content about__content-4">
            <h3 className="section__subheader opacity-0 transform translate-y-[50px] transition-all duration-1000">
              AI-POWERED IDENTIFICATION
            </h3>
            <h2 className="section__header opacity-0 transform translate-y-[50px] transition-all duration-1000">
              Instant Waste Classification
            </h2>
            <p className="opacity-0 transform translate-y-[50px] transition-all duration-1000">
              Our advanced machine learning model automatically identifies and categorizes waste from your uploaded images. Simply take a picture, and our system will classify it into recyclable, organic, hazardous, or other waste types, helping you understand how to properly dispose of each item.
            </p>
            <div className="about__btn opacity-0 transform translate-y-[50px] transition-all duration-1000">
              <Link to="/waste-upload" className="read-more">
                Try it now
                <span>
                  <i className="ri-arrow-right-line"></i>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <div className="section__container footer__container">
          <div className="footer__col">
            <div className="logo footer__logo">
              <a href="#">Half Engineer</a>
            </div>
            <p>
              Turning waste into opportunity. Report, recycle, and earn eco
              coins while saving the planet!
            </p>
          </div>
          <div className="footer__col">
            <h4>More About Us</h4>
            <ul className="footer__links">
              <li>
                <a href="#">About Half Engineer</a>
              </li>
              <li>
                <a href="#">Our Mission</a>
              </li>
              <li>
                <a href="#">Join as a Volunteer</a>
              </li>
              <li>
                <a href="#">Contact Us</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
            </ul>
          </div>
          <div className="footer__col">
            <h4>Explore</h4>
            <ul className="footer__links">
              <li>
                <a href="#">Waste Reporting</a>
              </li>
              <li>
                <a href="#">Eco Coin Rewards</a>
              </li>
              <li>
                <a href="#">Best Out of Waste Community</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer__bar">
          Copyright © 2024 Half Engineer. All rights reserved.
        </div>
      </footer>

      <style>{`
        :root {
          --primary-color: #0a1e27;
          --secondary-color: #e9c675;
          --text-light: #cbd5e1;
          --white: #ffffff;
          --max-width: 1200px;
          --header-font: "Playfair Display", serif;
        }

        * {
          padding: 0;
          margin: 0;
          box-sizing: border-box;
        }

        .section__container {
          max-width: var(--max-width);
          margin: auto;
          padding: 5rem 1rem;
        }

        .section__subheader {
          position: relative;
          isolation: isolate;
          margin-bottom: 1rem;
          padding-left: 5rem;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 2px;
          color: var(--secondary-color);
        }

        .section__subheader::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          height: 2px;
          width: 4rem;
          background-color: var(--secondary-color);
        }

        .section__subheader::after {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translate(-60%, -50%);
          font-size: 8rem;
          font-weight: 600;
          color: var(--white);
          opacity: 0.1;
          z-index: -1;
        }

        .about__content-1 .section__subheader::after {
          content: "01";
        }

        .about__content-2 .section__subheader::after {
          content: "02";
        }

        .about__content-3 .section__subheader::after {
          content: "03";
        }

        .about__content-4 .section__subheader::after {
          content: "04";
        }

        .section__header {
          margin-bottom: 1rem;
          font-size: 3rem;
          font-weight: 400;
          font-family: var(--header-font);
          color: var(--white);
        }

        .btn {
          padding: 0.75rem 1.5rem;
          outline: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1rem;
          color: var(--white);
          background-color: transparent;
          border-radius: 5px;
          transition: 0.3s;
          cursor: pointer;
        }

        .btn:hover {
          background-color: rgba(10, 30, 39, 0.5);
        }

        .logo a {
          font-size: 1.5rem;
          font-weight: 600;
          font-family: var(--header-font);
          color: var(--white);
        }

        img {
          display: flex;
          width: 100%;
          max-width: 400px;
          margin: auto;
          border-radius: 5px;
          box-shadow: 5px 5px 30px rgba(0, 0, 0, 0.4);
        }

        a {
          text-decoration: none;
          transition: 0.3s;
        }

        html,
        body {
          scroll-behavior: smooth;
        }

        body {
          font-family: "Poppins", sans-serif;
        }

        .header {
          position: relative;
          height: 100vh;
        }

        .header__bg {
          background-image: radial-gradient(
              rgba(255, 255, 255, 0),
              var(--primary-color)
            ),
            url("https://images.unsplash.com/photo-1661705969607-cde73828023d?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          z-index: -1;
        }

        .header__container {
          position: relative;
          isolation: isolate;
          height: calc(100% - 75px);
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        .header__content {
          max-width: 700px;
        }

        .header__content .section__header {
          font-size: 4rem;
          font-weight: 600;
          line-height: 5rem;
        }

        .header__content a {
          color: var(--white);
        }

        .header__content a:hover {
          color: var(--secondary-color);
        }

        .about {
          background-image: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0),
            var(--primary-color) 8rem
          );
          overflow: hidden;
        }

        .about__container {
          padding-top: 0;
          display: grid;
          gap: 5rem 2rem;
          overflow: hidden;
        }

        .about__content p {
          margin-bottom: 1.5rem;
          color: var(--text-light);
        }

        .about__content a {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--secondary-color);
        }

        .about__content a span {
          transition: 0.3s;
        }

        .about__content a:hover span {
          transform: translateX(10px);
        }

        .footer {
          background-color: var(--primary-color);
        }

        .footer__container {
          display: grid;
          gap: 4rem 2rem;
        }

        .footer__col:first-child {
          max-width: 300px;
        }

        .footer__logo {
          margin-bottom: 1rem;
        }

        .footer__col p {
          color: var(--text-light);
        }

        .footer__col h4 {
          margin-bottom: 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--secondary-color);
        }

        .footer__links {
          list-style: none;
          display: grid;
          gap: 1rem;
        }

        .footer__links a {
          color: var(--text-light);
        }

        .footer__links a:hover {
          color: var(--secondary-color);
        }

        .footer__bar {
          padding: 1rem;
          font-size: 0.9rem;
          color: var(--text-light);
          text-align: center;
        }

        @media (min-width: 768px) {
          .header__content {
            margin-left: 1rem;
          }

          .about__container {
            grid-template-columns: repeat(2, 1fr);
            align-items: center;
            gap: 10rem 2rem;
          }

          .about__image-1 {
            grid-area: 1/2/2/3;
          }

          .about__image-3 {
            grid-area: 3/2/4/3;
          }

          .about__content {
            margin-left: 6rem;
          }

          .footer__container {
            grid-template-columns: 2fr 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;