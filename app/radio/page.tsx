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
        currentAyah: 1,
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
  const hasYouTube = status.youtubeVideoId && status.youtubeVideoId.trim() !== "";

  return (
    <div className="space-y-4">
      <WindowBox title={hasYouTube ? "📺 Watch Live - Quran Majlis" : "📻 Radio Stream - Quran Majlis Live"}>
        <div className="text-center space-y-2">
          <p>
            {hasYouTube 
              ? "Watch the live Quran recitation from Majlis Haji Ebrahim Aldaqaq"
              : "Listen to the live Quran recitation from Majlis Haji Ebrahim Aldaqaq"}
          </p>
          <p className="text-sm text-muted-foreground">
            Note: Streaming is an optional feature. The stream may not always be available.
          </p>
        </div>
      </WindowBox>

      {/* Live Status */}
      <WindowBox title="📡 Stream Status">
        <div className="flex items-center justify-center py-4">
          <div className="text-center space-y-2">
            <LiveIndicator isLive={status.isLive} />
            <div className="text-sm text-muted-foreground">
              {status.isLive
                ? "The stream is currently live"
                : "The stream is currently offline"}
            </div>
          </div>
        </div>
      </WindowBox>

      {/* Video/Audio Player */}
      <WindowBox title={hasYouTube ? "📺 Live Video" : "🎵 Audio Player"}>
        <div className="space-y-4">
          <RadioPlayer
            streamUrl={status.radioStreamUrl || ""}
            youtubeVideoId={status.youtubeVideoId}
            isLive={status.isLive}
          />
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
            <div className="text-sm text-muted-foreground">
              Juz {status.currentJuz} - Page {status.currentPage}
            </div>
          </div>
        </WindowBox>
      )}

      {/* Instructions */}
      <WindowBox title="ℹ️ How to Listen">
        <div className="space-y-3 text-sm">
          <div className="border border-border p-3 bg-card text-card-foreground">
            <strong>Step 1:</strong> Check the stream status above
          </div>
          <div className="border border-border p-3 bg-muted text-muted-foreground">
            <strong>Step 2:</strong> If the stream is live, click the Play button
          </div>
          <div className="border border-border p-3 bg-card text-card-foreground">
            <strong>Step 3:</strong> Adjust the volume using the slider
          </div>
          <div className="border border-border p-3 bg-muted text-muted-foreground">
            <strong>Step 4:</strong> Click Stop to pause the stream
          </div>
        </div>
      </WindowBox>

      {/* Technical Info */}
      <WindowBox title="⚙️ Technical Information">
        <div className="text-sm text-muted-foreground space-y-2">
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
