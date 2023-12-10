import { useState, useEffect, useContext } from "react";
import { ConfigContext } from "./config";

export const Cart: React.FC = () => {
  const config = useContext(ConfigContext);
  if (config === null) throw new Error("Config not set");

  const [cart, setCart] = useState(null);

  useEffect(() => {
    fetch(`${config.api.baseUrl}/carts/1`)
      .then((res) => res.json())
      .then(setCart)
      .catch(console.error);
  }, [config]);

  return (
    <div>
      <h2>Cart</h2>
      <pre>{JSON.stringify(cart, null, 2)}</pre>
    </div>
  );
};
