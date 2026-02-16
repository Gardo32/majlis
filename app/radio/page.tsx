import prisma from "@/lib/prisma";
import { WindowBox } from "@/components/WindowBox";
import { RadioPlayer } from "@/components/RadioPlayer";
import { LiveIndicator } from "@/components/LiveIndicator";

async function getMajlisStatus() {
  let status = await prisma.majlisStatus.findFirst();
  
  if (!status) {
    status = await prisma.majlisStatus.create({
      data: {
        currentSurahArabic: "الفاتحة",
        currentSurahEnglish: "Al-Fatiha",
        currentJuz: 1,
        currentPage: 1,
        completionPercentage: 0,
        radioStreamUrl: "",
        isLive: false,
      },
    });
  }
  
  return status;
}

export default async function RadioPage() {
  const status = await getMajlisStatus();

  return (
    <div className="space-y-4">
      <WindowBox title="📻 Radio Stream - Quran Majlis Live">
        <div className="text-center space-y-2">
          <p>Listen to the live Quran recitation from Majlis Haji Ebrahim Aldaqaq</p>
          <p className="text-sm text-gray-600">
            Note: Radio streaming is an optional feature. The stream may not always be available.
          </p>
        </div>
      </WindowBox>

      {/* Live Status */}
      <WindowBox title="📡 Stream Status">
        <div className="flex items-center justify-center py-4">
          <div className="text-center space-y-2">
            <LiveIndicator isLive={status.isLive} />
            <div className="text-sm text-gray-600">
              {status.isLive
                ? "The stream is currently live"
                : "The stream is currently offline"}
            </div>
          </div>
        </div>
      </WindowBox>

      {/* Radio Player */}
      <WindowBox title="🎵 Audio Player">
        <div className="space-y-4">
          <RadioPlayer
            streamUrl={status.radioStreamUrl}
            isLive={status.isLive}
          />

          {status.radioStreamUrl && (
            <div className="text-sm text-gray-600 border border-black p-2 bg-gray-50">
              <strong>Stream URL:</strong>{" "}
              <code className="bg-gray-200 px-1">{status.radioStreamUrl}</code>
            </div>
          )}
        </div>
      </WindowBox>

      {/* Currently Reading */}
      {status.isLive && (
        <WindowBox title="📖 Currently Being Recited">
          <div className="text-center space-y-2">
            <div className="font-quran-arabic rtl text-3xl">
              {status.currentSurahArabic}
            </div>
            <div className="font-surah-english text-xl">
              {status.currentSurahEnglish}
            </div>
            <div className="text-sm text-gray-600">
              Juz {status.currentJuz} - Page {status.currentPage}
            </div>
          </div>
        </WindowBox>
      )}

      {/* Instructions */}
      <WindowBox title="ℹ️ How to Listen">
        <div className="space-y-3 text-sm">
          <div className="border border-black p-3 bg-gray-50">
            <strong>Step 1:</strong> Check the stream status above
          </div>
          <div className="border border-black p-3 bg-gray-50">
            <strong>Step 2:</strong> If the stream is live, click the Play button
          </div>
          <div className="border border-black p-3 bg-gray-50">
            <strong>Step 3:</strong> Adjust the volume using the slider
          </div>
          <div className="border border-black p-3 bg-gray-50">
            <strong>Step 4:</strong> Click Stop to pause the stream
          </div>
        </div>
      </WindowBox>

      {/* Technical Info */}
      <WindowBox title="⚙️ Technical Information">
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Stream Format:</strong> Icecast/MP3
          </p>
          <p>
            <strong>Compatibility:</strong> Works in all modern browsers
          </p>
          <p>
            <strong>Note:</strong> If you experience issues, try refreshing the
            page or using a different browser.
          </p>
        </div>
      </WindowBox>
    </div>
  );
}
