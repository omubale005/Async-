import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { mockDentalChart } from "../data/mockData";
import { ToothCondition, Patient } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { apiService } from "../../lib/api";
import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function DentalChart({ defaultPatientId }: { defaultPatientId?: string }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>(defaultPatientId || "");
  const [selectedTooth, setSelectedTooth] = useState<ToothCondition | null>(null);
  const [view, setView] = useState<"adult" | "chart">("adult");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await apiService.getPatients();
        setPatients(response.data);
        if (response.data.length > 0 && !defaultPatientId) {
          setSelectedPatient(response.data[0]._id || response.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching patients for chart:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [defaultPatientId]);

  const getToothColor = (conditions: string[]) => {
    if (conditions.includes("missing")) return "#ef4444"; // red
    if (conditions.includes("cavity")) return "#f59e0b"; // orange
    if (conditions.includes("root-canal")) return "#8b5cf6"; // purple
    if (conditions.includes("crown")) return "#3b82f6"; // blue
    if (conditions.includes("filling")) return "#10b981"; // green
    return "#f8fafc"; // white (healthy)
  };

  const getConditionBadge = (condition: string) => {
    const configs: Record<string, { className: string; label: string }> = {
      healthy: { className: "bg-gray-100 text-gray-700", label: "Healthy" },
      cavity: { className: "bg-orange-100 text-orange-700", label: "Cavity" },
      filling: { className: "bg-green-100 text-green-700", label: "Filling" },
      crown: { className: "bg-blue-100 text-blue-700", label: "Crown" },
      missing: { className: "bg-red-100 text-red-700", label: "Missing" },
      "root-canal": { className: "bg-purple-100 text-purple-700", label: "Root Canal" },
    };
    const config = configs[condition] || configs.healthy;
    return (
      <Badge className={config.className} variant="secondary">
        {config.label}
      </Badge>
    );
  };

  const patient = patients.find((p) => (p._id || p.id) === selectedPatient);

  // Tooth component with realistic design
  const Tooth = ({ tooth, isUpper }: { tooth: ToothCondition; isUpper: boolean }) => {
    const isSelected = selectedTooth?.toothNumber === tooth.toothNumber;
    const color = getToothColor(tooth.conditions);
    const isMissing = tooth.conditions.includes("missing");

    return (
      <motion.button
        whileHover={{ scale: 1.05, y: isUpper ? -3 : 3 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelectedTooth(tooth)}
        className={`relative group ${isSelected ? "z-20" : "z-10"}`}
      >
        <svg width="48" height="65" viewBox="0 0 48 65" className="drop-shadow-md">
          {/* Tooth Shape - Realistic */}
          {!isMissing ? (
            <>
              <defs>
                <linearGradient id={`grad-${tooth.toothNumber}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.85 }} />
                </linearGradient>
                <filter id={`shadow-${tooth.toothNumber}`}>
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
                </filter>
              </defs>
              
              {/* Main tooth body */}
              <path
                d="M24 8 C18 8, 14 12, 14 18 L14 42 C14 48, 18 58, 24 58 C30 58, 34 48, 34 42 L34 18 C34 12, 30 8, 24 8 Z"
                fill={`url(#grad-${tooth.toothNumber})`}
                stroke={isSelected ? "#1e40af" : "#cbd5e1"}
                strokeWidth={isSelected ? "2.5" : "1.5"}
                filter={`url(#shadow-${tooth.toothNumber})`}
              />
              
              {/* Highlight effect */}
              <ellipse
                cx="20"
                cy="22"
                rx="6"
                ry="10"
                fill="white"
                opacity="0.3"
              />
            </>
          ) : (
            // Missing tooth indicator
            <>
              <circle
                cx="24"
                cy="33"
                r="8"
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.5"
              />
              <line x1="18" y1="27" x2="30" y2="39" stroke={color} strokeWidth="2" opacity="0.5"/>
              <line x1="30" y1="27" x2="18" y2="39" stroke={color} strokeWidth="2" opacity="0.5"/>
            </>
          )}
        </svg>
        
        {/* Tooth number */}
        <div className={`absolute ${isUpper ? 'bottom-1' : 'top-1'} left-1/2 -translate-x-1/2`}>
          <span className={`text-[10px] font-bold ${isMissing ? 'text-gray-400' : 'text-gray-700'} bg-white/80 px-1.5 py-0.5 rounded`}>
            {tooth.toothNumber}
          </span>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
          </div>
        )}

        {/* Hover tooltip */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
          <div className="font-semibold">Tooth #{tooth.toothNumber}</div>
          <div className="text-[10px] text-gray-300 mt-0.5">
            {tooth.conditions.join(", ")}
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </motion.button>
    );
  };

  // Upper and lower jaw teeth (16 each)
  const upperTeeth = mockDentalChart.slice(0, 16);
  const lowerTeeth = mockDentalChart.slice(16, 32);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dental Chart</h1>
          <p className="text-sm text-gray-500 mt-1">
            Interactive dental charting and treatment planning
          </p>
        </div>
        {/* Show patient selector ONLY if not embedded in a specific patient's profile */}
        {!defaultPatientId && (
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient._id || patient.id} value={patient._id || patient.id || ""}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Patient Info */}
      {patient && (
        <Card className="border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-medium">
                    {patient.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-lg">{patient.name}</div>
                  <div className="text-sm text-gray-600 flex gap-4 mt-1">
                    <span>Age: {patient.age}</span>
                    <span>•</span>
                    <span>Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Patient ID</div>
                <div className="font-mono text-sm font-semibold text-gray-900">{patient._id || patient.id}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">
            Condition Legend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: "#f8fafc" }}></div>
              <span className="text-sm text-gray-700 font-medium">Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: "#f59e0b" }}></div>
              <span className="text-sm text-gray-700 font-medium">Cavity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: "#10b981" }}></div>
              <span className="text-sm text-gray-700 font-medium">Filling</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: "#3b82f6" }}></div>
              <span className="text-sm text-gray-700 font-medium">Crown</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: "#8b5cf6" }}></div>
              <span className="text-sm text-gray-700 font-medium">Root Canal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: "#ef4444" }}></div>
              <span className="text-sm text-gray-700 font-medium">Missing</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dental Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Adult Dentition - 32 Permanent Teeth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-10 p-6 bg-gradient-to-b from-gray-50 to-white rounded-xl">
              {/* Upper Jaw */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-4 text-center tracking-wider uppercase">
                  Maxillary (Upper) Arch
                </div>
                <div className="relative">
                  {/* Upper arch background */}
                  <div className="absolute inset-x-0 top-8 h-20 bg-gradient-to-b from-pink-100/50 to-transparent rounded-t-full"></div>
                  
                  <div className="flex justify-center items-start gap-1 relative z-10">
                    {upperTeeth.map((tooth) => (
                      <Tooth key={tooth.toothNumber} tooth={tooth} isUpper={true} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="border-t-2 border-dashed border-gray-300"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-1 text-xs text-gray-500 font-medium">
                  Occlusion Line
                </div>
              </div>

              {/* Lower Jaw */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-4 text-center tracking-wider uppercase">
                  Mandibular (Lower) Arch
                </div>
                <div className="relative">
                  {/* Lower arch background */}
                  <div className="absolute inset-x-0 bottom-8 h-20 bg-gradient-to-t from-pink-100/50 to-transparent rounded-b-full"></div>
                  
                  <div className="flex justify-center items-end gap-1 relative z-10">
                    {lowerTeeth.map((tooth) => (
                      <Tooth key={tooth.toothNumber} tooth={tooth} isUpper={false} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">Click on any tooth to view detailed information</p>
            </div>
          </CardContent>
        </Card>

        {/* Tooth Details */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
            <CardTitle className="text-lg">
              {selectedTooth ? `Tooth #${selectedTooth.toothNumber}` : "Tooth Details"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {selectedTooth ? (
              <div className="space-y-5">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-sm text-blue-600 font-medium mb-2">Tooth Number</div>
                  <div className="text-4xl font-bold text-blue-900">
                    #{selectedTooth.toothNumber}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {selectedTooth.toothNumber <= 16 ? 'Upper Jaw' : 'Lower Jaw'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">Current Conditions</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTooth.conditions.map((condition) => (
                      <div key={condition}>{getConditionBadge(condition)}</div>
                    ))}
                  </div>
                </div>

                {selectedTooth.notes && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-3">Clinical Notes</div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200 leading-relaxed">
                      {selectedTooth.notes}
                    </div>
                  </div>
                )}

                <div className="pt-4 space-y-2 border-t">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Add Treatment
                  </Button>
                  <Button variant="outline" className="w-full">
                    View History
                  </Button>
                  <Button variant="outline" className="w-full">
                    Add Notes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm font-medium">No tooth selected</p>
                <p className="text-xs mt-1">Click on a tooth to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Treatment Summary */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <CardTitle className="text-lg">Treatment Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-gray-900">
                  {mockDentalChart.filter((t) => t.conditions.includes("healthy")).length}
                </span>
              </div>
              <div className="text-xs text-gray-600 font-medium">Healthy Teeth</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-orange-600">
                  {mockDentalChart.filter((t) => t.conditions.includes("cavity")).length}
                </span>
              </div>
              <div className="text-xs text-gray-600 font-medium">Cavities</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-green-600">
                  {mockDentalChart.filter((t) => t.conditions.includes("filling")).length}
                </span>
              </div>
              <div className="text-xs text-gray-600 font-medium">Fillings</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-blue-600">
                  {mockDentalChart.filter((t) => t.conditions.includes("crown")).length}
                </span>
              </div>
              <div className="text-xs text-gray-600 font-medium">Crowns</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-purple-600">
                  {mockDentalChart.filter((t) => t.conditions.includes("root-canal")).length}
                </span>
              </div>
              <div className="text-xs text-gray-600 font-medium">Root Canals</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-red-600">
                  {mockDentalChart.filter((t) => t.conditions.includes("missing")).length}
                </span>
              </div>
              <div className="text-xs text-gray-600 font-medium">Missing Teeth</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}