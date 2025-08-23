import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { seedMoviesFromJSON, type ImportSummary } from '../utils/movieSeeder';

// Import the JSON data
import moviesData from '../data/csvjson.json';

const DatabaseSeeder: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingSummary, setSeedingSummary] = useState<ImportSummary | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedingSummary(null);
    setShowSummary(false);

    try {
      const summary = await seedMoviesFromJSON(moviesData);
      setSeedingSummary(summary);
      setShowSummary(true);
    } catch (error) {
      setSeedingSummary({
        addedCount: 0,
        skippedDuplicates: 0,
        invalidRows: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      });
      setShowSummary(true);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Seed Button */}
      <button
        onClick={handleSeedDatabase}
        disabled={isSeeding}
        className="flex items-center gap-2 px-4 py-3 bg-[rgba(16,18,24,0.9)] backdrop-blur-xl border border-[rgba(0,224,255,0.2)] rounded-lg hover:border-[#00E0FF] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSeeding ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Seeding Database...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span>Seed Movies</span>
          </>
        )}
      </button>

      {/* Summary Modal */}
      {showSummary && seedingSummary && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSummary(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-[rgba(16,18,24,0.95)] backdrop-blur-xl border border-[rgba(0,224,255,0.1)] rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-space-grotesk text-[#00E0FF]">
                Import Summary
              </h3>
              <button
                onClick={() => setShowSummary(false)}
                className="p-2 hover:bg-[rgba(0,224,255,0.1)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Success Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-xl font-bold text-[#F2F4F8]">{seedingSummary.addedCount}</div>
                  <div className="text-xs text-[#A6A9B3]">Added</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-xl font-bold text-[#F2F4F8]">{seedingSummary.skippedDuplicates}</div>
                  <div className="text-xs text-[#A6A9B3]">Skipped</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-xl font-bold text-[#F2F4F8]">{seedingSummary.invalidRows}</div>
                  <div className="text-xs text-[#A6A9B3]">Invalid</div>
                </div>
              </div>

              {/* Errors */}
              {seedingSummary.errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-400 mb-2">Errors:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {seedingSummary.errors.slice(0, 5).map((error, index) => (
                      <p key={index} className="text-xs text-red-300 bg-red-500/10 p-2 rounded">
                        {error}
                      </p>
                    ))}
                    {seedingSummary.errors.length > 5 && (
                      <p className="text-xs text-[#A6A9B3]">
                        ... and {seedingSummary.errors.length - 5} more errors
                      </p>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowSummary(false)}
                className="w-full py-2 bg-[#00E0FF] text-[#0B0B10] rounded-lg hover:bg-[#00C0E0] transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DatabaseSeeder;