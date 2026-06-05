import api from "./api";

const getAuthHeaders = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

export const fetchRevisionItems = async () => {
  const res = await api.get("/revision", {
    headers: getAuthHeaders()
  });
  return res.data;
};

export const addRevisionItem = async (data) => {
  const res = await api.post("/revision", data, {
    headers: getAuthHeaders()
  });
  return res.data;
};

export const updateRevisionReview = async (reviewData) => {
  const res = await api.put("/revision", reviewData, {
    headers: getAuthHeaders()
  });
  return res.data;
};

export const deleteRevisionItem = async (id) => {
  const res = await api.delete(`/revision?id=${id}`, {
    headers: getAuthHeaders()
  });
  return res.data;
};

export const generateAIKnowledgeCard = async (id) => {
  const res = await api.post("/revision/generate-card", { id }, {
    headers: getAuthHeaders()
  });
  return res.data;
};

export const updateDailyLimit = async (maxReviewsPerDay) => {
  const res = await api.put("/revision/limit", { maxReviewsPerDay }, {
    headers: getAuthHeaders()
  });
  return res.data;
};
