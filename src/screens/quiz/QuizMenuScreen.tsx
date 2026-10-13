import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { NavBar } from '../../components/NavBar';
import { Toggle } from '../../components/Toggle';
import type { DifficultyLevel } from '../../domain/ranks';
import { useQuiz } from '../../state/QuizContext';
import { useT } from '../../state/SettingsContext';
import { CategoryPicker } from './CategoryPicker';
import { DifficultyPicker } from './DifficultyPicker';
import { RankPicker } from './RankPicker';
import './QuizMenuScreen.css';

export function QuizMenuScreen() {
  const t = useT();
  const { state, dispatch, availableCount, startQuiz } = useQuiz();
  const { config } = state;
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);

  return (
    <>
      <NavBar large title={t('nav.quiz')} />
      <div className="quiz-menu">
        <section className="quiz-menu__hero">
          <Icon name="brain" size={48} className="quiz-menu__hero-icon" />
          <h2 className="quiz-menu__hero-title">{t('quiz.headerTitle')}</h2>
          <p className="quiz-menu__caption">{t('quiz.headerSubtitle')}</p>
        </section>

        <section className="quiz-menu__card">
          <h2 className="quiz-menu__heading">{t('quiz.selectRank')}</h2>
          <p className="quiz-menu__caption">{t('quiz.rankCaption')}</p>
          <RankPicker
            value={config.rank}
            onChange={(rank) => {
              setDifficulty(null);
              dispatch({ type: 'SET_CONFIG', partial: { rank } });
            }}
          />
        </section>

        <section className="quiz-menu__card">
          <h2 className="quiz-menu__heading">{t('quiz.quickDifficulty')}</h2>
          <p className="quiz-menu__caption">{t('quiz.quickDifficultyCaption')}</p>
          <DifficultyPicker
            value={difficulty}
            onChange={(level, rank) => {
              setDifficulty(level);
              dispatch({ type: 'SET_CONFIG', partial: { rank } });
            }}
          />
        </section>

        <section className="quiz-menu__card">
          <h2 className="quiz-menu__heading">{t('quiz.category')}</h2>
          <p className="quiz-menu__caption">{t('quiz.categoryCaption')}</p>
          <CategoryPicker
            value={config.category}
            onChange={(category) => dispatch({ type: 'SET_CONFIG', partial: { category } })}
          />
        </section>

        <section className="quiz-menu__card">
          <h2 className="quiz-menu__heading">{t('quiz.settings')}</h2>
          <label className="quiz-menu__setting">
            <span className="quiz-menu__setting-row">
              <span>{t('quiz.numberOfQuestions')}</span>
              <span className="quiz-menu__value">{config.numberOfQuestions}</span>
            </span>
            <input
              type="range"
              className="quiz-menu__range"
              min={5}
              max={30}
              step={5}
              value={config.numberOfQuestions}
              onChange={(event) => dispatch({ type: 'SET_CONFIG', partial: { numberOfQuestions: Number(event.target.value) } })}
            />
          </label>
          <div className="quiz-menu__setting-row">
            <span id="quiz-menu-timed">{t('quiz.timed')}</span>
            <Toggle
              checked={config.timed}
              onChange={(timed) => dispatch({ type: 'SET_CONFIG', partial: { timed } })}
              labelledBy="quiz-menu-timed"
            />
          </div>
          {config.timed && (
            <label className="quiz-menu__setting">
              <span className="quiz-menu__setting-row">
                <span>{t('quiz.timeLimit')}</span>
                <span className="quiz-menu__value">{t('quiz.minutes', { count: config.timeLimitSec / 60 })}</span>
              </span>
              <input
                type="range"
                className="quiz-menu__range"
                min={300}
                max={1800}
                step={300}
                value={config.timeLimitSec}
                onChange={(event) => dispatch({ type: 'SET_CONFIG', partial: { timeLimitSec: Number(event.target.value) } })}
              />
            </label>
          )}
          <p className="quiz-menu__available">
            <Icon name="info" size={14} className="quiz-menu__available-icon" />
            {t('quiz.availableQuestions', { count: availableCount })}
          </p>
        </section>

        <button type="button" className="quiz-menu__start" disabled={availableCount === 0} onClick={startQuiz}>
          <Icon name="play" size={22} />
          {t('quiz.start')}
        </button>
      </div>
    </>
  );
}
