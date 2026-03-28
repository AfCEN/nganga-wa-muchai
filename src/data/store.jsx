import { createContext, useContext, useReducer, useEffect, useCallback, useState } from "react";
import { api } from "./api";
import {
  seedPeople,
  seedConnections,
  seedStories,
  seedStoryTrails,
  seedEvents,
} from "./seedData";

// ============================================================
// Reducer
// ============================================================
const ActionTypes = {
  SET_ALL: "SET_ALL",
  ADD_PERSON: "ADD_PERSON",
  REPLACE_PERSON: "REPLACE_PERSON",
  REMOVE_PERSON: "REMOVE_PERSON",
  UPDATE_PERSON: "UPDATE_PERSON",
  ADD_CONNECTION: "ADD_CONNECTION",
  REPLACE_CONNECTION: "REPLACE_CONNECTION",
  REMOVE_CONNECTION: "REMOVE_CONNECTION",
  ADD_STORY: "ADD_STORY",
  REPLACE_STORY: "REPLACE_STORY",
  REMOVE_STORY: "REMOVE_STORY",
  UPDATE_STORY: "UPDATE_STORY",
  ADD_EVENT: "ADD_EVENT",
  REPLACE_EVENT: "REPLACE_EVENT",
  REMOVE_EVENT: "REMOVE_EVENT",
  ADD_STORY_TRAIL: "ADD_STORY_TRAIL",
  REPLACE_STORY_TRAIL: "REPLACE_STORY_TRAIL",
  REMOVE_STORY_TRAIL: "REMOVE_STORY_TRAIL",
  RESET_DATA: "RESET_DATA",
};

const EMPTY_STATE = {
  people: [],
  connections: [],
  stories: [],
  storyTrails: [],
  events: [],
};

function familyReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_ALL:
      return { ...action.payload };

    // --- People ---
    case ActionTypes.ADD_PERSON:
      return { ...state, people: [...state.people, action.payload] };
    case ActionTypes.REPLACE_PERSON:
      return {
        ...state,
        people: state.people.map((p) =>
          p.id === action.payload.tempId ? action.payload.data : p
        ),
      };
    case ActionTypes.REMOVE_PERSON:
      return { ...state, people: state.people.filter((p) => p.id !== action.payload) };
    case ActionTypes.UPDATE_PERSON:
      return {
        ...state,
        people: state.people.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
      };

    // --- Connections ---
    case ActionTypes.ADD_CONNECTION:
      return { ...state, connections: [...state.connections, action.payload] };
    case ActionTypes.REPLACE_CONNECTION:
      return {
        ...state,
        connections: state.connections.map((c) =>
          c.id === action.payload.tempId ? action.payload.data : c
        ),
      };
    case ActionTypes.REMOVE_CONNECTION:
      return { ...state, connections: state.connections.filter((c) => c.id !== action.payload) };

    // --- Stories ---
    case ActionTypes.ADD_STORY:
      return { ...state, stories: [...state.stories, action.payload] };
    case ActionTypes.REPLACE_STORY:
      return {
        ...state,
        stories: state.stories.map((s) =>
          s.id === action.payload.tempId ? action.payload.data : s
        ),
      };
    case ActionTypes.REMOVE_STORY:
      return { ...state, stories: state.stories.filter((s) => s.id !== action.payload) };
    case ActionTypes.UPDATE_STORY:
      return {
        ...state,
        stories: state.stories.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s
        ),
      };

    // --- Events ---
    case ActionTypes.ADD_EVENT:
      return { ...state, events: [...state.events, action.payload] };
    case ActionTypes.REPLACE_EVENT:
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload.tempId ? action.payload.data : e
        ),
      };
    case ActionTypes.REMOVE_EVENT:
      return { ...state, events: state.events.filter((e) => e.id !== action.payload) };

    // --- Story Trails ---
    case ActionTypes.ADD_STORY_TRAIL:
      return { ...state, storyTrails: [...state.storyTrails, action.payload] };
    case ActionTypes.REPLACE_STORY_TRAIL:
      return {
        ...state,
        storyTrails: state.storyTrails.map((t) =>
          t.id === action.payload.tempId ? action.payload.data : t
        ),
      };
    case ActionTypes.REMOVE_STORY_TRAIL:
      return { ...state, storyTrails: state.storyTrails.filter((t) => t.id !== action.payload) };

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
  const [state, dispatch] = useReducer(familyReducer, EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data from API on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        const [people, connections, stories, events, storyTrails] = await Promise.all([
          api.get("/api/people"),
          api.get("/api/connections"),
          api.get("/api/stories"),
          api.get("/api/events"),
          api.get("/api/trails"),
        ]);
        if (!cancelled) {
          dispatch({
            type: ActionTypes.SET_ALL,
            payload: { people, connections, stories, storyTrails, events },
          });
        }
      } catch (err) {
        console.warn("API fetch failed, falling back to seed data:", err.message);
        if (!cancelled) {
          dispatch({
            type: ActionTypes.SET_ALL,
            payload: {
              people: seedPeople,
              connections: seedConnections,
              stories: seedStories,
              storyTrails: seedStoryTrails,
              events: seedEvents,
            },
          });
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  // --- Optimistic mutation helpers ---

  const addPerson = useCallback(async (person) => {
    const tempId = person.id || `p_temp_${Date.now()}`;
    const optimistic = { ...person, id: tempId };
    dispatch({ type: ActionTypes.ADD_PERSON, payload: optimistic });

    try {
      const created = await api.post("/api/people", person);
      dispatch({ type: ActionTypes.REPLACE_PERSON, payload: { tempId, data: created } });
      return created;
    } catch (err) {
      dispatch({ type: ActionTypes.REMOVE_PERSON, payload: tempId });
      throw err;
    }
  }, []);

  const updatePerson = useCallback((personUpdate) => {
    dispatch({ type: ActionTypes.UPDATE_PERSON, payload: personUpdate });
    api.put(`/api/people/${personUpdate.id}`, personUpdate).catch(() => {
      // Could add rollback here if needed
    });
  }, []);

  const addConnection = useCallback(async (connection) => {
    const tempId = connection.id || `c_temp_${Date.now()}`;
    const optimistic = { ...connection, id: tempId };
    dispatch({ type: ActionTypes.ADD_CONNECTION, payload: optimistic });

    try {
      const created = await api.post("/api/connections", connection);
      dispatch({ type: ActionTypes.REPLACE_CONNECTION, payload: { tempId, data: created } });
      return created;
    } catch (err) {
      dispatch({ type: ActionTypes.REMOVE_CONNECTION, payload: tempId });
      throw err;
    }
  }, []);

  const addStory = useCallback(async (story) => {
    const tempId = story.id || `s_temp_${Date.now()}`;
    const optimistic = { ...story, id: tempId };
    dispatch({ type: ActionTypes.ADD_STORY, payload: optimistic });

    try {
      const created = await api.post("/api/stories", story);
      dispatch({ type: ActionTypes.REPLACE_STORY, payload: { tempId, data: created } });
      return created;
    } catch (err) {
      dispatch({ type: ActionTypes.REMOVE_STORY, payload: tempId });
      throw err;
    }
  }, []);

  const updateStory = useCallback((storyUpdate) => {
    dispatch({ type: ActionTypes.UPDATE_STORY, payload: storyUpdate });
    api.put(`/api/stories/${storyUpdate.id}`, storyUpdate).catch(() => {});
  }, []);

  const addEvent = useCallback(async (event) => {
    const tempId = event.id || `e_temp_${Date.now()}`;
    const optimistic = { ...event, id: tempId };
    dispatch({ type: ActionTypes.ADD_EVENT, payload: optimistic });

    try {
      const created = await api.post("/api/events", event);
      dispatch({ type: ActionTypes.REPLACE_EVENT, payload: { tempId, data: created } });
      return created;
    } catch (err) {
      dispatch({ type: ActionTypes.REMOVE_EVENT, payload: tempId });
      throw err;
    }
  }, []);

  const addStoryTrail = useCallback(async (trail) => {
    const tempId = trail.id || `t_temp_${Date.now()}`;
    const optimistic = { ...trail, id: tempId };
    dispatch({ type: ActionTypes.ADD_STORY_TRAIL, payload: optimistic });

    try {
      const created = await api.post("/api/trails", trail);
      dispatch({ type: ActionTypes.REPLACE_STORY_TRAIL, payload: { tempId, data: created } });
      return created;
    } catch (err) {
      dispatch({ type: ActionTypes.REMOVE_STORY_TRAIL, payload: tempId });
      throw err;
    }
  }, []);

  const deletePerson = useCallback(async (personId) => {
    dispatch({ type: ActionTypes.REMOVE_PERSON, payload: personId });
    try {
      await api.delete(`/api/people/${personId}`);
    } catch (err) {
      // Re-fetch to restore state on failure
      const people = await api.get("/api/people");
      dispatch({ type: ActionTypes.SET_ALL, payload: { ...state, people } });
      throw err;
    }
  }, [state]);

  const deleteStory = useCallback(async (storyId) => {
    dispatch({ type: ActionTypes.REMOVE_STORY, payload: storyId });
    try {
      await api.delete(`/api/stories/${storyId}`);
    } catch (err) {
      const stories = await api.get("/api/stories");
      dispatch({ type: ActionTypes.SET_ALL, payload: { ...state, stories } });
      throw err;
    }
  }, [state]);

  const deleteConnection = useCallback(async (connId) => {
    dispatch({ type: ActionTypes.REMOVE_CONNECTION, payload: connId });
    try {
      await api.delete(`/api/connections/${connId}`);
    } catch (err) {
      const connections = await api.get("/api/connections");
      dispatch({ type: ActionTypes.SET_ALL, payload: { ...state, connections } });
      throw err;
    }
  }, [state]);

  const deleteEvent = useCallback(async (eventId) => {
    dispatch({ type: ActionTypes.REMOVE_EVENT, payload: eventId });
    try {
      await api.delete(`/api/events/${eventId}`);
    } catch (err) {
      const events = await api.get("/api/events");
      dispatch({ type: ActionTypes.SET_ALL, payload: { ...state, events } });
      throw err;
    }
  }, [state]);

  const deleteStoryTrail = useCallback(async (trailId) => {
    dispatch({ type: ActionTypes.REMOVE_STORY_TRAIL, payload: trailId });
    try {
      await api.delete(`/api/trails/${trailId}`);
    } catch (err) {
      const storyTrails = await api.get("/api/trails");
      dispatch({ type: ActionTypes.SET_ALL, payload: { ...state, storyTrails } });
      throw err;
    }
  }, [state]);

  const resetData = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_DATA });
  }, []);

  // --- Query helpers (synchronous reads from local state — unchanged) ---

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
    loading,
    error,

    // Mutations
    addPerson,
    updatePerson,
    deletePerson,
    addConnection,
    deleteConnection,
    addStory,
    updateStory,
    deleteStory,
    addEvent,
    deleteEvent,
    addStoryTrail,
    deleteStoryTrail,
    resetData,

    // Queries (synchronous reads from local state)
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
