// 동적 연예인 검색 앱 (한글 버전)

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CelebrityDetail from './pages/CelebrityDetail';
import BeautyDirection from './pages/BeautyDirection';
import './index.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/celebrity/:id" element={<CelebrityDetail />} />
      <Route path="/direction/:id" element={<BeautyDirection />} />
    </Routes>
  );
}
