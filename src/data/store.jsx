import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import {
  seedPeople,
  seedConnections,
  seedStories,
  seedStoryTrails,
  seedEvents,
} from "./seedData";

// ============================================================
// Local Storage helpers
// ============================================================
const STORAGE_KEY = "nganga-wa-muchai-v2";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Basic validation — make sure core arrays exist
      if (parsed && Array.isArray(parsed.people) && Array.isArray(parsed.stories)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to load data from localStorage, falling back to seed data.", err);
  }
  return null;
}

function saveToStorage(state) {
  try {
    const serializable = {
      people: state.people,
      connections: state.connections,
      stories: state.stories,
      storyTrails: state.storyTrails,
      events: state.events,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (err) {
    console.warn("Failed to save data to localStorage.", err);
  }
}

// ============================================================
// Initial state
// ============================================================
function getInitialState() {
  const stored = loadFromStorage();
  if (stored) return stored;
  return {
    people: seedPeople,
    connections: seedConnections,
    stories: seedStories,
    storyTrails: seedStoryTrails,
    events: seedEvents,
  };
}

// ============================================================
// Reducer
// ============================================================
const ActionTypes = {
  ADD_PERSON: "ADD_PERSON",
  UPDATE_PERSON: "UPDATE_PERSON",
  ADD_CONNECTION: "ADD_CONNECTION",
  ADD_STORY: "ADD_STORY",
  UPDATE_STORY: "UPDATE_STORY",
  ADD_EVENT: "ADD_EVENT",
  ADD_STORY_TRAIL: "ADD_STORY_TRAIL",
  RESET_DATA: "RESET_DATA",
};

function familyReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_PERSON:
      return { ...state, people: [...state.people, action.payload] };

    case ActionTypes.UPDATE_PERSON:
      return {
        ...state,
        people: state.people.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
      };

    case ActionTypes.ADD_CONNECTION:
      return { ...state, connections: [...state.connections, action.payload] };

    case ActionTypes.ADD_STORY:
      return { ...state, stories: [...state.stories, action.payload] };

    case ActionTypes.UPDATE_STORY:
      return {
        ...state,
        stories: state.stories.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s
        ),
      };

    case ActionTypes.ADD_EVENT:
      return { ...state, events: [...state.events, action.payload] };

    case ActionTypes.ADD_STORY_TRAIL:
      return { ...state, storyTrails: [...state.storyTrails, action.payload] };

    case ActionTypes.RESET_DATA:
      return {
        people: seedPeople,
        connections: seedConnections,
        stories: seedStories,
        storyTrails: seedStoryTrails,
        events: seedEvents,
      };

    default:
      return state;
  }
}

// ============================================================
// Context
// ============================================================
const FamilyContext = createContext(null);

// ============================================================
// Provider
// ============================================================
export function FamilyProvider({ children }) {
  const [state, dispatch] = useReducer(familyReducer, null, getInitialState);

  // Persist every state change to localStorage
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  // --- Action creators ---

  const addPerson = useCallback(
    (person) => {
      const id = person.id || `p${Date.now()}`;
      dispatch({ type: ActionTypes.ADD_PERSON, payload: { ...person, id } });
      return id;
    },
    []
  );

  const updatePerson = useCallback(
    (personUpdate) => {
      dispatch({ type: ActionTypes.UPDATE_PERSON, payload: personUpdate });
    },
    []
  );

  const addConnection = useCallback(
    (connection) => {
      const id = connection.id || `c${Date.now()}`;
      dispatch({ type: ActionTypes.ADD_CONNECTION, payload: { ...connection, id } });
      return id;
    },
    []
  );

  const addStory = useCallback(
    (story) => {
      const id = story.id || `s${Date.now()}`;
      dispatch({ type: ActionTypes.ADD_STORY, payload: { ...story, id } });
      return id;
    },
    []
  );

  const updateStory = useCallback(
    (storyUpdate) => {
      dispatch({ type: ActionTypes.UPDATE_STORY, payload: storyUpdate });
    },
    []
  );

  const addEvent = useCallback(
    (event) => {
      const id = event.id || `e${Date.now()}`;
      dispatch({ type: ActionTypes.ADD_EVENT, payload: { ...event, id } });
      return id;
    },
    []
  );

  const addStoryTrail = useCallback(
    (trail) => {
      const id = trail.id || `t${Date.now()}`;
      dispatch({ type: ActionTypes.ADD_STORY_TRAIL, payload: { ...trail, id } });
      return id;
    },
    []
  );

  const resetData = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_DATA });
  }, []);

  // --- Query helpers ---

  const getPersonById = useCallback(
    (id) => state.people.find((p) => p.id === id) || null,
    [state.people]
  );

  const getStoriesForPerson = useCallback(
    (personId) =>
      state.stories.filter(
        (s) => s.personIds && s.personIds.includes(personId)
      ),
    [state.stories]
  );

  const getConnectionsForPerson = useCallback(
    (personId) =>
      state.connections.filter(
        (c) => c.source === personId || c.target === personId
      ),
    [state.connections]
  );

  const getEventsForPerson = useCallback(
    (personId) =>
      state.events.filter(
        (e) => e.personIds && e.personIds.includes(personId)
      ),
    [state.events]
  );

  const getStoryById = useCallback(
    (id) => state.stories.find((s) => s.id === id) || null,
    [state.stories]
  );

  const getStoryTrailById = useCallback(
    (id) => state.storyTrails.find((t) => t.id === id) || null,
    [state.storyTrails]
  );

  const value = {
    // State
    people: state.people,
    connections: state.connections,
    stories: state.stories,
    storyTrails: state.storyTrails,
    events: state.events,

    // Mutations
    addPerson,
    updatePerson,
    addConnection,
    addStory,
    updateStory,
    addEvent,
    addStoryTrail,
    resetData,

    // Queries
    getPersonById,
    getStoriesForPerson,
    getConnectionsForPerson,
    getEventsForPerson,
    getStoryById,
    getStoryTrailById,
  };

  return (
    <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================
export function useFamilyStore() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error(
      "useFamilyStore must be used within a <FamilyProvider>. " +
        "Wrap your app with <FamilyProvider> in main.jsx or App.jsx."
    );
  }
  return context;
}

export { FamilyContext };
