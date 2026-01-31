import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Download, Server, HardDrive, Terminal, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflineTilesGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-4 py-4 shadow-lg flex items-center gap-4">
        <Link to={createPageUrl('Settings')}>
          <Button variant="ghost" size="icon" className="text-amber-100 hover:bg-amber-600">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-medieval font-bold text-amber-100">Offline Map Tiles Guide</h1>
          <p className="text-amber-200/70 text-sm">Run completely offline on Raspberry Pi</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Overview */}
        <div className="bg-white rounded-xl border-2 border-amber-300 p-6">
          <h2 className="text-2xl font-medieval font-bold text-amber-800 mb-3">Overview</h2>
          <p className="text-gray-700 leading-relaxed">
            This guide shows you how to download San Francisco map tiles and serve them locally on your Raspberry Pi Zero 2 W 
            for completely offline operation. No internet connection required during use!
          </p>
        </div>

        {/* Storage Requirements */}
        <div className="bg-blue-50 rounded-xl border-2 border-blue-300 p-6">
          <div className="flex items-start gap-3">
            <HardDrive className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Storage Estimates (San Francisco)</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li><strong>Zoom 10-14:</strong> ~50-100MB (city overview, low detail)</li>
                <li><strong>Zoom 10-16:</strong> ~200-500MB (good for navigation) ⭐ Recommended</li>
                <li><strong>Zoom 10-18:</strong> ~1-2GB (full street-level detail)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 1 */}
        <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white text-green-700 font-bold flex items-center justify-center">1</div>
            <h3 className="font-medieval font-bold text-white text-lg">Download Map Tiles</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Option A: Using MOBAC (Easiest)
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
                <li>Download MOBAC from: <a href="https://mobac.sourceforge.io/" target="_blank" className="text-blue-600 underline">mobac.sourceforge.io</a></li>
                <li>Launch MOBAC and configure:
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-gray-600">
                    <li><strong>Atlas Format:</strong> OSMDroid SQLite</li>
                    <li><strong>Map Source:</strong> OpenStreetMap Mapnik</li>
                    <li><strong>Zoom Levels:</strong> 10-16 (recommended)</li>
                  </ul>
                </li>
                <li>Select San Francisco area:
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-gray-600">
                    <li>Top-left: 37.8324, -122.5243</li>
                    <li>Bottom-right: 37.7034, -122.3544</li>
                  </ul>
                </li>
                <li>Click "Add Selection" → "Create Atlas"</li>
                <li>Output: <code className="bg-gray-100 px-2 py-1 rounded text-xs">sf_tiles.mbtiles</code> (SQLite file)</li>
              </ol>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Option B: Using tile-dl (Python)
              </h4>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                <div className="mb-2 text-gray-400"># Install tile-dl</div>
                <div>pip install tile-dl</div>
                <div className="mt-3 mb-2 text-gray-400"># Download SF tiles</div>
                <div>tile-dl --lat-min 37.7034 --lat-max 37.8324 \</div>
                <div className="ml-8">--lon-min -122.5243 --lon-max -122.3544 \</div>
                <div className="ml-8">--zoom-min 10 --zoom-max 16 \</div>
                <div className="ml-8">--output sf_tiles \</div>
                <div className="ml-8">--url "https://tile.openstreetmap.org/&#123;z&#125;/&#123;x&#125;/&#123;y&#125;.png"</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Creates folder structure: <code>sf_tiles/&#123;z&#125;/&#123;x&#125;/&#123;y&#125;.png</code></p>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white text-blue-700 font-bold flex items-center justify-center">2</div>
            <h3 className="font-medieval font-bold text-white text-lg">Transfer Tiles to Raspberry Pi</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Via Network (SCP)</h4>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono">
                <div className="mb-1 text-gray-400"># Copy folder to Pi</div>
                <div>scp -r sf_tiles pi@raspberrypi.local:/home/pi/</div>
                <div className="mt-3 mb-1 text-gray-400"># Or for .mbtiles file</div>
                <div>scp sf_tiles.mbtiles pi@raspberrypi.local:/home/pi/</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-bold text-gray-800 mb-2">Direct SD Card Copy</h4>
              <p className="text-sm text-gray-700">Remove SD card from Pi, insert into computer, copy files directly to <code className="bg-gray-100 px-2 py-1 rounded">/home/pi/</code></p>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white text-purple-700 font-bold flex items-center justify-center">3</div>
            <h3 className="font-medieval font-bold text-white text-lg">Serve Tiles on Raspberry Pi</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Server className="w-4 h-4" />
                Option A: Simple Python Server (Easiest)
              </h4>
              <p className="text-sm text-gray-700 mb-2">If you have folder structure from tile-dl:</p>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono mb-2">
                <div>cd /home/pi/sf_tiles</div>
                <div>python3 -m http.server 8080</div>
              </div>
              <div className="bg-green-50 border border-green-300 rounded-lg p-3">
                <p className="text-xs text-green-800 font-medium mb-1">Then in app Settings, set Custom Tile URL to:</p>
                <code className="bg-white px-2 py-1 rounded text-xs text-green-900 block">http://localhost:8080/&#123;z&#125;/&#123;x&#125;/&#123;y&#125;.png</code>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-bold text-gray-800 mb-2">Option B: MBTiles with tileserver-gl-light</h4>
              <p className="text-sm text-gray-700 mb-2">If you have .mbtiles file from MOBAC:</p>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono mb-2">
                <div className="mb-1 text-gray-400"># Install Node.js (if needed)</div>
                <div>curl -fsSL https://deb.nodesource.com/setup_16.x | sudo bash -</div>
                <div>sudo apt-get install -y nodejs</div>
                <div className="mt-3 mb-1 text-gray-400"># Install tileserver</div>
                <div>sudo npm install -g tileserver-gl-light</div>
                <div className="mt-3 mb-1 text-gray-400"># Serve tiles</div>
                <div>tileserver-gl-light /home/pi/sf_tiles.mbtiles --port 8080</div>
              </div>
              <div className="bg-green-50 border border-green-300 rounded-lg p-3">
                <p className="text-xs text-green-800 font-medium mb-1">Then in app Settings, set Custom Tile URL to:</p>
                <code className="bg-white px-2 py-1 rounded text-xs text-green-900 block">http://localhost:8080/styles/basic-preview/&#123;z&#125;/&#123;x&#125;/&#123;y&#125;.png</code>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white text-amber-700 font-bold flex items-center justify-center">4</div>
            <h3 className="font-medieval font-bold text-white text-lg">Configure App</h3>
          </div>
          <div className="p-6">
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Open app <strong>Settings</strong></li>
              <li>Under "Map Display", set <strong>Map Style</strong> to "Custom Tile Server"</li>
              <li>Enter your <strong>Custom Tile URL</strong> (from Step 3)</li>
              <li>Save and navigate to Explorer page to test</li>
            </ol>
          </div>
        </div>

        {/* Auto-start */}
        <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="bg-amber-100 px-4 py-3">
            <h3 className="font-medieval font-bold text-amber-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Auto-Start Tile Server on Boot
            </h3>
          </div>
          <div className="p-6 space-y-3">
            <p className="text-sm text-gray-700">Make the tile server start automatically when Pi boots:</p>
            <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono">
              <div className="mb-1 text-gray-400"># Edit rc.local</div>
              <div>sudo nano /etc/rc.local</div>
              <div className="mt-3 mb-1 text-gray-400"># Add before "exit 0":</div>
              <div>cd /home/pi/sf_tiles && python3 -m http.server 8080 &</div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-red-50 rounded-xl border-2 border-red-300 p-6">
          <h3 className="font-medieval font-bold text-red-800 flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5" />
            Troubleshooting
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-red-900">Tiles not loading?</p>
              <ul className="list-disc list-inside ml-2 text-red-800 space-y-1">
                <li>Check tile server is running: <code className="bg-red-100 px-1 rounded">ps aux | grep python</code></li>
                <li>Verify port 8080 isn't blocked by firewall</li>
                <li>Test URL in browser: <code className="bg-red-100 px-1 rounded">http://localhost:8080/10/163/395.png</code></li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-red-900">Slow performance?</p>
              <ul className="list-disc list-inside ml-2 text-red-800 space-y-1">
                <li>Reduce max zoom level (try 10-15 instead of 10-18)</li>
                <li>Use lighter tile format or smaller area</li>
                <li>Pi Zero 2 W may have 1-2 second tile load times</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-red-900">Out of storage?</p>
              <ul className="list-disc list-inside ml-2 text-red-800 space-y-1">
                <li>Lower max zoom level</li>
                <li>Reduce geographic area</li>
                <li>Use external USB drive for tiles</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Performance Notes */}
        <div className="bg-yellow-50 rounded-xl border-2 border-yellow-300 p-6">
          <h3 className="font-medieval font-bold text-yellow-900 mb-3">⚠️ Performance Notes</h3>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li>• Pi Zero 2 W has limited CPU - expect 1-2 second tile load times</li>
            <li>• Test performance before full deployment to ensure acceptable speeds</li>
            <li>• Consider overclocking Pi if tiles load too slowly</li>
            <li>• Class 10 or better SD card recommended for faster I/O</li>
          </ul>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <h3 className="font-medieval font-bold text-xl mb-3">🎉 You're All Set!</h3>
          <p className="text-green-100">
            Once configured, your RuneScape exploration app will run completely offline, 
            perfect for wilderness adventures where internet isn't available. Happy exploring!
          </p>
        </div>
      </div>
    </div>
  );
}