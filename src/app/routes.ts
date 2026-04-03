import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import TradeJournal from "./pages/TradeJournal";
import BestTradingDays from "./pages/BestTradingDays";
import StrategyAnalysis from "./pages/StrategyAnalysis";
import CapitalRisk from "./pages/CapitalRisk";
import EquityDrawdown from "./pages/EquityDrawdown";
import MistakeTracker from "./pages/MistakeTracker";
import TradeHistory from "./pages/TradeHistory";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import CurrencyConverter from "./pages/CurrencyConverter";
import MonthlyCalendar from "./pages/MonthlyCalendar";
import MindHealth from "./pages/MindHealth";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "trade-journal", Component: TradeJournal },
      { path: "monthly-calendar", Component: MonthlyCalendar },
      { path: "best-trading-days", Component: BestTradingDays },
      { path: "strategy-analysis", Component: StrategyAnalysis },
      { path: "capital-risk", Component: CapitalRisk },
      { path: "equity-drawdown", Component: EquityDrawdown },
      { path: "mistake-tracker", Component: MistakeTracker },
      { path: "trade-history", Component: TradeHistory },
      { path: "currency-converter", Component: CurrencyConverter },
      { path: "mind-health", Component: MindHealth }
    ]
  }
]);
