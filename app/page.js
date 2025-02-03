"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [janCode, setJanCode] = useState("");
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);
  
  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/get-product/?jan_code=${janCode}`);
      setProduct({ ...response.data, quantity: 1 });
    } catch (error) {
      setProduct({ name: "商品がマスタ未登録です", price: 0, quantity: 1 });
    }
  };

  const addToCart = () => {
    if (product && product.name !== "商品がマスタ未登録です") {
      const newCart = [...cart, { ...product, quantity }];
      setCart(newCart);
      setProduct(null);
      setJanCode("");
      setQuantity(1);
    }
  };

  const updateQuantity = (index, newQuantity) => {
    const newCart = cart.map((item, i) => i === index ? { ...item, quantity: newQuantity } : item);
    setCart(newCart);
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) - 20; // -20円の割引を適用
  };

  const purchase = async () => {
    alert(`合計金額（税込）: ${calculateTotal()}円`);
    setCart([]);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>POSアプリ</h2>
      
      {/* JANコード入力 */}
      <input 
        value={janCode} 
        onChange={(e) => setJanCode(e.target.value)} 
        placeholder="JANコードを入力" 
        style={{ width: "60%", padding: "8px", marginBottom: "10px" }}
      />
      <button onClick={fetchProduct} style={{ marginLeft: "5px", padding: "8px" }}>カメラで読み込む</button>

      {/* 商品情報表示 */}
      {product && (
        <div style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px", borderRadius: "5px" }}>
          <h3>商品情報</h3>
          <p>商品名：{product.name}</p>
          <p>価格：{product.price}円 × 
            <input 
              type="number" 
              value={quantity} 
              min="1" 
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
              style={{ width: "40px", marginLeft: "5px" }}
            />
          </p>
          <button onClick={addToCart} style={{ marginRight: "5px", padding: "8px" }}>追加</button>
        </div>
      )}

      {/* 購入リスト */}
      <h3>購入リスト</h3>
      <div style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "5px" }}>
        {cart.length === 0 ? <p>カートが空です</p> : cart.map((item, index) => (
          <div key={index} style={{ borderBottom: "1px solid #ddd", padding: "5px" }}>
            <p>{item.name} {item.price}円 × {item.quantity} = {item.price * item.quantity}円</p>
            <button onClick={() => updateQuantity(index, item.quantity + 1)}>＋</button>
            <button onClick={() => updateQuantity(index, Math.max(1, item.quantity - 1))}>－</button>
            <button onClick={() => removeFromCart(index)}>削除</button>
          </div>
        ))}
        {/* キャンペーン割引 */}
        {cart.length > 0 && <p>秋のキャンペーン（-20円） {calculateTotal()}円</p>}
      </div>

      {/* 購入ボタン */}
      <button onClick={purchase} style={{ width: "100%", marginTop: "10px", padding: "10px", fontSize: "16px" }}>購入する</button>
    </div>
  );
}
