"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [janCode, setJanCode] = useState("");
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);

  // ✅ 環境変数からバックエンドのURLを取得
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://tech0-gen8-step4-pos-app-100.azurewebsites.net";

  // ✅ 商品を検索する関数
  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${backendUrl}/get-product/?jan_code=${janCode}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // ✅ 認証情報を送信
      });

      if (response.data && response.data.name) {
        setProduct({ ...response.data, price: Number(response.data.price), quantity: 1 });
      } else {
        setProduct({ name: "商品がマスタ未登録です", price: 0, quantity: 1 });
      }
    } catch (error) {
      console.error("❌ 商品検索エラー:", error.response?.data || error.message);
      setProduct({ name: "商品がマスタ未登録です", price: 0, quantity: 1 });
    }
  };

  // ✅ カートに商品を追加
  const addToCart = () => {
    if (product && product.name !== "商品がマスタ未登録です") {
      setCart([...cart, { ...product, quantity }]);
      setProduct(null);
      setJanCode("");
      setQuantity(1);
    }
  };

  // ✅ カート内の商品の数量を更新
  const updateQuantity = (index, newQuantity) => {
    setCart(cart.map((item, i) => (i === index ? { ...item, quantity: newQuantity } : item)));
  };

  // ✅ カートから商品を削除
  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // ✅ 合計金額を計算
  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1), 0);
  };

  // ✅ 購入ボタンを押した時の処理
  const purchase = async () => {
    for (const item of cart) {
      const transactionData = {
        EMP_CD: "9999999999",
        POS_NO: "90",
        PRD_ID: item.PRD_ID,
        PRD_CODE: item.CODE,
        PRD_NAME: item.name,
        PRD_PRICE: item.price,
        TAX_CD: "10",
      };

      console.log("🔍 送信データ:", JSON.stringify(transactionData, null, 2));

      try {
        const response = await axios.post(`${backendUrl}/transactions/`, transactionData, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // ✅ CORS 対策
        });

        console.log(`✅ 購入成功！合計金額（税込）: ${response.data.total_amount}円`);
      } catch (error) {
        console.error("❌ 購入エラー:", error.response?.data || error.message);
        alert(`購入処理でエラーが発生しました: ${error.response?.data?.detail || error.message}`);
        return;
      }
    }

    alert("すべての商品が購入されました");
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
      <button onClick={fetchProduct} style={{ marginLeft: "5px", padding: "8px" }}>
        商品検索
      </button>

      {/* 商品情報表示 */}
      {product && (
        <div style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px", borderRadius: "5px" }}>
          <h3>商品情報</h3>
          <p>商品名：{product.name}</p>
          <p>
            価格：{product.price}円 ×
            <input
              type="number"
              value={quantity}
              min="1"
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
              style={{ width: "40px", marginLeft: "5px" }}
            />
          </p>
          <button onClick={addToCart} style={{ marginRight: "5px", padding: "8px" }}>
            追加
          </button>
        </div>
      )}

      {/* 購入リスト */}
      <h3>購入リスト</h3>
      <div style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "5px" }}>
        {cart.length === 0 ? (
          <p>カートが空です</p>
        ) : (
          cart.map((item, index) => (
            <div key={index} style={{ borderBottom: "1px solid #ddd", padding: "5px" }}>
              <p>
                {item.name} {item.price}円 × {item.quantity} = {item.price * item.quantity}円
              </p>
              <button onClick={() => updateQuantity(index, item.quantity + 1)}>＋</button>
              <button onClick={() => updateQuantity(index, Math.max(1, item.quantity - 1))}>－</button>
              <button onClick={() => removeFromCart(index)}>削除</button>
            </div>
          ))
        )}
      </div>

      {/* 合計金額表示 */}
      {cart.length > 0 && <p>合計金額: {calculateTotal()}円</p>}

      {/* 購入ボタン */}
      <button onClick={purchase} style={{ width: "100%", marginTop: "10px", padding: "10px", fontSize: "16px" }}>
        購入する
      </button>
    </div>
  );
}
