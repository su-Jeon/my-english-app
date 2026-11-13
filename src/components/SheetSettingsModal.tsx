import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Copy,
  Check,
  ExternalLink,
  Save,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  GOOGLE_APPS_SCRIPT_SOURCE,
  getStoredGasUrl,
  setStoredGasUrl,
  testGasConnection,
} from '../utils/sheetService';

interface SheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavedUrl?: (url: string) => void;
}

export const SheetSettingsModal: React.FC<SheetSettingsModalProps> = ({
  isOpen,
  onClose,
  onSavedUrl,
}) => {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'url' | 'script'>('url');

  useEffect(() => {
    if (isOpen) {
      setUrl(getStoredGasUrl());
      setTestStatus({ loading: false });
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_SOURCE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSaveUrl = () => {
    const trimmed = url.trim();
    setStoredGasUrl(trimmed);
    if (onSavedUrl) {
      onSavedUrl(trimmed);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!url.trim()) {
      setTestStatus({
        loading: false,
        success: false,
        message: '먼저 웹 앱 URL을 입력해주세요.',
      });
      return;
    }
    setTestStatus({ loading: true });
    const result = await testGasConnection(url);
    setTestStatus({
      loading: false,
      success: result.success,
      message: result.message,
    });
  };

  return (
    <div
      id="sheet-settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="sheet-settings-modal"
        className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-600/40 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                구글 스프레드시트 연동 설정
              </h3>
              <p className="text-xs text-zinc-400">
                게임 종료 시 구글 시트에 플레이 결과 자동 행 추가
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/30 px-4 pt-2">
          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            웹 앱 URL 연결
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'script'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            앱스 스크립트 코드 (Code.gs)
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
          {activeTab === 'url' ? (
            <div className="space-y-4">
              {/* URL Input Form */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span>Google Apps Script 웹 앱 URL</span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    /exec 로 끝나는 주소
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveUrl}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>URL 저장 완료!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>URL 저장</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleTestConnection}
                  disabled={testStatus.loading}
                  className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Activity className={`w-3.5 h-3.5 ${testStatus.loading ? 'animate-spin' : ''}`} />
                  <span>연결 테스트</span>
                </button>
              </div>

              {/* Test Status feedback */}
              {testStatus.message && (
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2 text-xs ${
                    testStatus.success
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {testStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{testStatus.message}</span>
                </div>
              )}

              {/* Step-by-step setup guide */}
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-xs text-zinc-300">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <HelpCircle className="w-4 h-4" />
                  <span>구글 스프레드시트 3분 연동 방법</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 pl-0.5 leading-relaxed">
                  <li>
                    본인의 구글 시트를 열고 상단 메뉴 <strong className="text-zinc-200">[확장 프로그램] &gt; [Apps Script]</strong>를 클릭합니다.
                  </li>
                  <li>
                    상단 탭의 <strong className="text-amber-300">[앱스 스크립트 코드]</strong>에서 코드를 복사해 편집창에 붙여넣고 저장(Ctrl+S)합니다.
                  </li>
                  <li>
                    우측 상단 <strong className="text-zinc-200">[배포] &gt; [새 배포]</strong> 클릭 후 톱니바퀴에서 <strong className="text-zinc-200">[웹 앱]</strong>을 선택합니다.
                  </li>
                  <li>
                    <strong className="text-rose-400">액세스 권한: 모든 사용자 (Anyone)</strong>로 설정한 뒤 [배포]를 누릅니다.
                  </li>
                  <li>
                    생성된 <strong className="text-zinc-200">웹 앱 URL</strong>을 복사하여 위 입력칸에 넣고 [URL 저장]을 누르면 완료됩니다.
                  </li>
                </ol>
              </div>

              {/* Data Columns Summary */}
              <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80 text-[11px] text-zinc-400">
                <span className="font-semibold text-zinc-300 block mb-1">
                  저장되는 구글 시트 열 (자동 생성됨):
                </span>
                <code className="text-amber-300 font-mono break-all">
                  timestamp, name, play_count, correct_count, wrong_count, final_suspicion, result, questions_attempted, wrong_expressions
                </code>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  구글 스프레드시트의 <code className="text-amber-300 font-mono">Code.gs</code>에 붙여넣을 코드입니다.
                </p>
                <button
                  onClick={handleCopyCode}
                  className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>복사됨!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>코드 전체 복사</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code viewer */}
              <div className="relative rounded-xl bg-black border border-zinc-800 overflow-hidden">
                <div className="px-3 py-1.5 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Code.gs</span>
                  <span>Google Apps Script</span>
                </div>
                <pre className="p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-72 leading-relaxed selection:bg-amber-500 selection:text-black">
                  {GOOGLE_APPS_SCRIPT_SOURCE}
                </pre>
              </div>

              <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                <span>
                  구글 시트 상단 메뉴 [확장 프로그램] &gt; [Apps Script]에서 붙여넣으세요.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
