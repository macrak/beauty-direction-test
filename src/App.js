// 동적 연예인 검색 앱 (한글 버전)

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import CelebrityDetail from './pages/CelebrityDetail';
import BeautyDirection from './pages/BeautyDirection';
import AiExposureLanding from './pages/AiExposureLanding';
import OpeningMarketing from './pages/OpeningMarketing';
import './index.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/celebrity/:id" element={<CelebrityDetail />} />
      <Route path="/direction/:id" element={<BeautyDirection />} />
      <Route path="/ai-exposure" element={<AiExposureLanding />} />
      <Route path="/opening-marketing" element={<OpeningMarketing />} />
      {/* 체크리스트를 개원마케팅 페이지 안으로 흡수 — 기존 링크는 그대로 유효하도록 리다이렉트 */}
      <Route path="/opening-checklist" element={<Navigate to="/opening-marketing" replace />} />
    </Routes>
  );
}
