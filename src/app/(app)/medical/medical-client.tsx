'use client'

import React, { useState } from 'react'
import { Plus, Syringe, Stethoscope, TrendingUp } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { VaccineTab } from '@/components/medical/vaccine-tab'
import { DoctorVisitTab } from '@/components/medical/doctor-visit-tab'
import { GrowthTab } from '@/components/medical/growth-tab'
import type { Vaccine, DoctorVisit, GrowthLog } from '@/types/medical'

interface MedicalClientProps {
  vaccines: Vaccine[]
  visits: DoctorVisit[]
  growthLogs: GrowthLog[]
  userId: string
}

export function MedicalClient({ vaccines: initVaccines, visits: initVisits, growthLogs: initGrowthLogs, userId }: MedicalClientProps) {
  const [vaccines, setVaccines] = useState<Vaccine[]>(initVaccines)
  const [visits, setVisits] = useState<DoctorVisit[]>(initVisits)
  const [growthLogs, setGrowthLogs] = useState<GrowthLog[]>(initGrowthLogs)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--on-surface)]">Medical History</h2>
        <p className="text-sm text-[var(--on-surface-muted)]">Vaccines, visits, and growth tracking</p>
      </div>

      <Tabs defaultValue="vaccines">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="vaccines" className="flex-1 sm:flex-none">
            <Syringe className="w-3.5 h-3.5 mr-1.5" />Vaccines
          </TabsTrigger>
          <TabsTrigger value="visits" className="flex-1 sm:flex-none">
            <Stethoscope className="w-3.5 h-3.5 mr-1.5" />Visits
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex-1 sm:flex-none">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />Growth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vaccines">
          <VaccineTab vaccines={vaccines} onUpdate={setVaccines} userId={userId} />
        </TabsContent>
        <TabsContent value="visits">
          <DoctorVisitTab visits={visits} onUpdate={setVisits} userId={userId} />
        </TabsContent>
        <TabsContent value="growth">
          <GrowthTab logs={growthLogs} onUpdate={setGrowthLogs} userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
