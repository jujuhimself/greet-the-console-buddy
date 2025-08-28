import React from 'react';
import { Route } from 'react-router-dom';
import PharmacyForecast from '@/pages/pharmacy/PharmacyForecast';
import WholesaleForecast from '@/pages/wholesale/WholesaleForecast';

export const ForecastRoutes = () => (
  <>
    <Route path="/pharmacy/forecast" element={<PharmacyForecast />} />
    <Route path="/wholesale/forecast" element={<WholesaleForecast />} />
  </>
);