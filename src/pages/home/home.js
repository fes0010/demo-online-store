import "./home.css";
import { Helmet } from "react-helmet-async";
import ScrollUp from "../../components/scrollUp/scrollUp";
import {
  Component1,
  Component2,
  Component3,
  Component4,
  Component5,
  Component6,
  Component7,
  Component8,
} from "./Components/Components";
import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

// Time config
let today = new Date();
let twoDaysLater = new Date(today);
twoDaysLater.setDate(today.getDate() + 2);

const Home = ({ Data, SetData }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Map Supabase data to Component structure
        const mappedProducts = data.map(p => ({
          id: p.id,
          title: p.title,
          price: p.price_retail,
          oldPrice: p.price_retail * 1.2, // Mock old price
          discount: "-20%",
          img: p.images && p.images.length > 0 ? p.images[0] : "https://via.placeholder.com/300?text=No+Image",
          reviewStar: 4.5,
          numperReview: 12,
          cardActive: ""
        }));

        setProducts(mappedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const HomeData = Data.Home;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border" style={{ color: "var(--mix_red)" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Shanga Beauty Shop | Home</title>
        <meta name="description" content="Shanga Beauty Shop | ecommerce website create using react" />
      </Helmet>

      <Component1 Data={HomeData.Component1} />

      <Component2
        TargetDate={twoDaysLater}
        Data={products.length > 0 ? products : HomeData.Component2}
        rawData={Data}
        setrawData={SetData}
      />

      <HOne />
      <Component3 Data={HomeData.Component3} />
      <HOne />

      <Component4
        Data={products.length > 0 ? products : HomeData.Component4}
        rawData={Data}
        setrawData={SetData}
      />

      <Component5 TargetDate={twoDaysLater} Data={HomeData.Component5} />
      <Component6
        Data={products.length > 0 ? products.slice(0, 4) : HomeData.Component6}
        rawData={Data}
        setrawData={SetData}
      />
      <Component7 Data={HomeData.Component7} />
      <Component8 Data={HomeData.Component8} />
      <ScrollUp />
    </>
  );
};

function HOne() {
  return (
    <div className="d-flex justify-content-center">
      <hr></hr>
    </div>
  );
}

export default Home;
