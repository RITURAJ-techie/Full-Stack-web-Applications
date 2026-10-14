
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaLongArrowAltRight } from "react-icons/fa";
import useFetch from "../useFetch";

const collections = [
  {
    eyebrow: "THE DAILY ROTATION",
    title: "Good things,\nwell chosen.",
    description: "Everyday essentials that deserve a place in your wardrobe.",
    image:
      "https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=900",
    className: "collection-one",
  },
  {
    eyebrow: "MADE FOR THE MOMENT",
    title: "Your next\nfavourite find.",
    description: "Fresh picks for the days you want to feel a little different.",
    image:
      "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=900",
    className: "collection-two",
  },
];

export default function Home() {
  const { data, loading, error } = useFetch(
    `${import.meta.env.VITE_API_URL}/api/categories`,
  );

  const navigate = useNavigate();

  return (
    <main className="WearVeird-home">
      <section className="WearVeird-hero">
        <div className="WearVeird-hero-copy">
          <span className="eyebrow">
            A LITTLE SOMETHING FOR EVERY DAY
          </span>

          <h1 className="display-heading">
            Your style.
            <br />
            Your <span>kind</span>
            <br />
            of thing.
          </h1>

          <p className="WearVeird-hero-description">
            Thoughtful finds, everyday essentials, and pieces that just feel
            right. Your next favourite thing starts here.
          </p>

          <div className="WearVeird-hero-actions">
            <button
              className="WearVeird-button"
              onClick={() => navigate("/productlistings")}
            >
              Explore the collection <FaArrowRight size={14} />
            </button>

            <a href="#shop-by-category" className="WearVeird-text-link">
              Find your style <FaLongArrowAltRight size={15} />
            </a>
          </div>

          <div className="WearVeird-hero-footnote">
            <span className="WearVeird-footnote-dot" />
            GOOD FINDS. GOOD FEELINGS.
          </div>
        </div>

        <div className="WearVeird-hero-visual">
          <img
            src="https://images.pexels.com/photos/1884584/pexels-photo-1884584.jpeg?auto=compress&cs=tinysrgb&w=1400"
            alt="Fashion inspiration from the latest collection"
            className="WearVeird-hero-image"
          />

          <div className="WearVeird-hero-image-overlay" />

          <div className="WearVeird-hero-sticker">
            <span>THE</span>
            <strong>GOOD</strong>
            <strong>STUFF</strong>
            <span>STARTS HERE.</span>
          </div>

          <div className="WearVeird-image-caption">
            <span>01 / THE EVERYDAY EDIT</span>
            <span>DISCOVER MORE ↗</span>
          </div>
        </div>

        <div className="WearVeird-hero-index">S / N — 001</div>
      </section>

      <section id="shop-by-category" className="WearVeird-category-section">
        <div className="WearVeird-section-top">
          <div>
            <span className="eyebrow">A GOOD PLACE TO START</span>
            <h2 className="section-heading">What are we feeling?</h2>
          </div>

          <Link to="/productlistings" className="WearVeird-text-link">
            Shop everything <FaArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="WearVeird-state">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading categories...</span>
            </div>
            <p>Finding the good stuff...</p>
          </div>
        ) : error ? (
          <div className="WearVeird-state WearVeird-error">
            <p>We couldn't load the collections right now.</p>
            <button
              className="WearVeird-button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        ) : Array.isArray(data) && data.length > 0 ? (
          <div className="WearVeird-category-grid">
            {data.map((item, index) => (
              <Link
                key={item._id}
                to={`/productlistings/${item._id}`}
                className={`WearVeird-category-card category-tone-${index % 4}`}
              >
                <div className="WearVeird-category-image-wrap">
                  {item.categoryURL ? (
                    <img
                      src={item.categoryURL}
                      alt={item.name}
                      className="WearVeird-category-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="WearVeird-category-placeholder">
                      {item.name}
                    </div>
                  )}

                  <span className="WearVeird-category-arrow">
                    <FaArrowRight size={15} />
                  </span>
                </div>

                <div className="WearVeird-category-info">
                  <div>
                    <span className="WearVeird-category-index">
                      COLLECTION 0{index + 1}
                    </span>
                    <h3>{item.name}</h3>
                  </div>
                  <FaArrowRight size={15} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="WearVeird-state">
            <p>Our collections are getting ready. Check back soon.</p>
          </div>
        )}
      </section>

      <section className="WearVeird-statement">
        <span className="eyebrow">LESS SCROLLING. BETTER FINDING.</span>
        <h2 className="display-heading">
          Not more stuff.
          <br />
          <span>More your stuff.</span>
        </h2>
        <p>
          Discover pieces that match your mood, make your day, and feel like
          they were picked just for you.
        </p>
        <button
          className="WearVeird-button WearVeird-button-light"
          onClick={() => navigate("/productlistings")}
        >
          Find your next favourite <FaArrowRight size={14} />
        </button>
        <span className="WearVeird-statement-decoration" aria-hidden="true">
          S/N
        </span>
      </section>

      <section className="WearVeird-collections">
        <div className="WearVeird-section-top">
          <div>
            <span className="eyebrow">A FEW THINGS WE LOVE</span>
            <h2 className="section-heading">Your next chapter.</h2>
          </div>
          <span className="WearVeird-muted">GOOD FINDS, ALWAYS.</span>
        </div>

        <div className="WearVeird-collection-grid">
          {collections.map((collection, index) => (
            <article
              key={collection.title}
              className={`WearVeird-collection-card ${collection.className}`}
            >
              <img
                src={collection.image}
                alt={collection.title.replace("\n", " ")}
                loading="lazy"
              />

              <div className="WearVeird-collection-overlay" />

              <div className="WearVeird-collection-copy">
                <span>{collection.eyebrow}</span>
                <h3 className="display-heading">
                  {collection.title.split("\n").map((line, i) => (
                    <span key={line}>
                      {i > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </h3>
                <p>{collection.description}</p>
                <button
                  className="WearVeird-collection-link"
                  onClick={() => navigate("/productlistings")}
                >
                  Explore now <FaArrowRight size={13} />
                </button>
              </div>

              <span className="WearVeird-collection-number">
                0{index + 1}
              </span>
            </article>
          ))}
        </div>
      </section>

      <footer className="WearVeird-home-footer">
        <Link to="/" className="WearVeird-brand">
          WearVeird<span>.</span>
        </Link>
        <p>Find the things that feel like you.</p>
        <Link to="/productlistings" className="WearVeird-text-link">
          Keep exploring <FaArrowRight size={13} />
        </Link>
      </footer>
    </main>
  );
}
