import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { sampleCelebrities } from '../data/celebrities';

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // 검색어 매칭 함수
  const matches = item => item.name.toLowerCase().includes(query.toLowerCase());

  // 성별별 필터링
  const maleList = sampleCelebrities.filter(item => item.gender === 'male' && matches(item));
  const femaleList = sampleCelebrities.filter(item => item.gender === 'female' && matches(item));

  // 리스트 렌더링 함수
  const renderList = (items) => (
    <AnimatePresence>
      {items.map(item => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card>
            <h2 className="text-xl font-semibold mb-1">{item.name}</h2>
            <p className="text-gray-600 mb-2">{item.description}</p>
            <Button className="w-full" onClick={() => navigate(`/celebrity/${item.id}`)}>
              자세히 보기
            </Button>
          </Card>
        </motion.div>
      ))}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-4xl mx-auto mb-6">
        <h1 className="text-3xl font-bold mb-4">나답게 예뻐지세요</h1>
        <div className="flex gap-2">
          <Input
            placeholder="연예인 이름을 입력하세요..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <Button onClick={() => setQuery('')}>초기화</Button>
        </div>
        <Link to="/real-price" className="inline-block mt-3 text-sm text-emerald-700 underline">
          찐가격 — 한국인이 실제로 낸 시술 가격 보기 →
        </Link>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">남자 연예인 목록</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {maleList.length
              ? renderList(maleList)
              : <p>조건에 맞는 남자 연예인이 없습니다.</p>
            }
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">여자 연예인 목록</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {femaleList.length
              ? renderList(femaleList)
              : <p>조건에 맞는 여자 연예인이 없습니다.</p>
            }
          </div>
        </section>
      </main>
    </div>
  );
}
