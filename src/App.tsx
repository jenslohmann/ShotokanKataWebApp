import { Sidebar } from './components/Sidebar';
import { TabBar } from './components/TabBar';
import { sectionOf, type Route } from './router/router';
import { useRoute } from './router/useRoute';
import { AboutScreen } from './screens/about/AboutScreen';
import { KataListScreen } from './screens/kata/KataListScreen';
import { QuizMenuScreen } from './screens/quiz/QuizMenuScreen';
import { VocabularyListScreen } from './screens/vocabulary/VocabularyListScreen';
import { SettingsProvider } from './state/SettingsContext';
import './App.css';

function Screen({ route }: { route: Route }) {
  switch (route.name) {
    case 'kataList':
    case 'kataDetail':
      return <KataListScreen />;
    case 'quizMenu':
    case 'quizPlay':
      return <QuizMenuScreen />;
    case 'vocabList':
    case 'vocabDetail':
      return <VocabularyListScreen />;
    case 'about':
      return <AboutScreen />;
  }
}

function Shell() {
  const route = useRoute();
  const section = sectionOf(route);
  const fullScreen = route.name === 'quizPlay';
  return (
    <div className={`app${fullScreen ? ' app--full-screen' : ''}`}>
      {!fullScreen && <Sidebar active={section} />}
      <main className="app__content">
        <div className="app__column">
          <Screen route={route} />
        </div>
      </main>
      {!fullScreen && <TabBar active={section} />}
    </div>
  );
}

export function App() {
  return (
    <SettingsProvider>
      <Shell />
    </SettingsProvider>
  );
}
