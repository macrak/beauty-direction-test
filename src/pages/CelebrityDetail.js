import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { sampleCelebrities } from '../data/celebrities';

const genderLabel = { male: '남성', female: '여성' };

export default function CelebrityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const celebrity = sampleCelebrities.find(item => String(item.id) === id);

  if (!celebrity) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <p className="mb-4">해당 연예인을 찾을 수 없습니다.</p>
          <Link to="/" className="text-pink-500 underline">목록으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Button className="mb-6 w-auto" onClick={() => navigate(-1)}>
          ← 뒤로 가기
        </Button>

        <Card>
          <h1 className="text-3xl font-bold mb-2">{celebrity.name}</h1>
          <p className="text-gray-500 mb-4">{genderLabel[celebrity.gender]}</p>
          <p className="text-gray-700 text-lg mb-6">{celebrity.description}</p>
          <Button className="w-full" onClick={() => navigate(`/direction/${celebrity.id}`)}>
            나에게 맞는 뷰티 방향 찾기
          </Button>
        </Card>
      </div>
    </div>
  );
}
