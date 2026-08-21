import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { sampleCelebrities } from '../data/celebrities';
import {
  faceShapeOptions,
  eyeShapeOptions,
  skinToneOptions,
  generateDirection,
} from '../data/beautyGuide';

const Select = ({ label, value, onChange, options }) => (
  <label className="block mb-4">
    <span className="block mb-1 font-medium">{label}</span>
    <select
      className="w-full border p-2 rounded"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="" disabled>선택해주세요</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </label>
);

export default function BeautyDirection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const celebrity = sampleCelebrities.find(item => String(item.id) === id);

  const [faceShape, setFaceShape] = useState('');
  const [eyeShape, setEyeShape] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [result, setResult] = useState(null);

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

  const isComplete = faceShape && eyeShape && skinTone;

  const handleSubmit = e => {
    e.preventDefault();
    if (!isComplete) return;
    setResult(generateDirection(celebrity, { faceShape, eyeShape, skinTone }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Button className="mb-6 w-auto" onClick={() => navigate(-1)}>
          ← 뒤로 가기
        </Button>

        <Card className="mb-6">
          <h1 className="text-2xl font-bold mb-1">나의 뷰티 방향성 찾기</h1>
          <p className="text-gray-600">
            원하는 스타일: <span className="font-semibold">{celebrity.name}</span>
            {' · '}{celebrity.description}
          </p>
        </Card>

        <Card className="mb-6">
          <form onSubmit={handleSubmit}>
            <Select label="내 얼굴형" value={faceShape} onChange={setFaceShape} options={faceShapeOptions} />
            <Select label="내 눈매" value={eyeShape} onChange={setEyeShape} options={eyeShapeOptions} />
            <Select label="내 피부톤" value={skinTone} onChange={setSkinTone} options={skinToneOptions} />
            <Button type="submit" className="w-full" disabled={!isComplete}>
              나의 방향성 보기
            </Button>
          </form>
        </Card>

        {result && (
          <Card>
            <p className="text-gray-800 mb-4">{result.intro}</p>
            <ul className="space-y-3 mb-4">
              {result.points.map(point => (
                <li key={point.title}>
                  <p className="font-semibold">{point.title}</p>
                  <p className="text-gray-600">{point.text}</p>
                </li>
              ))}
            </ul>
            <p className="text-gray-800">{result.outro}</p>
            <p className="text-xs text-gray-400 mt-4">
              * 이 결과는 스타일 참고용 제안이며, 전문가 상담이나 시술을 대체하지 않습니다.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
