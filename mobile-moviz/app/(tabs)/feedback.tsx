import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/utils/constants";
import api from "@/utils/api";

export default function FeedbackScreen() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const subjectRef = useRef<TextInput>(null);
  const messageRef = useRef<TextInput>(null);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setSending(true);
    try {
      const { data } = await api.post("/feedback", form);
      Alert.alert("Success", data.message || "Feedback sent! Thank you.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Something went wrong. Try again later."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Send Feedback</Text>
            <Text style={styles.subtitle}>
              Got a suggestion, found a bug, or just want to say hi? We'd love
              to hear from you.
            </Text>
          </View>

          {/* Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={COLORS.textMuted}
              value={form.name}
              onChangeText={(v) => updateField("name", v)}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textMuted}
              value={form.email}
              onChangeText={(v) => updateField("email", v)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => subjectRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Subject */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              ref={subjectRef}
              style={styles.input}
              placeholder="Optional subject"
              placeholderTextColor={COLORS.textMuted}
              value={form.subject}
              onChangeText={(v) => updateField("subject", v)}
              returnKeyType="next"
              onSubmitEditing={() => messageRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Message */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Message <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              ref={messageRef}
              style={[styles.input, styles.textArea]}
              placeholder="What's on your mind?"
              placeholderTextColor={COLORS.textMuted}
              value={form.message}
              onChangeText={(v) => updateField("message", v)}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              returnKeyType="default"
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, sending && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.submitText}>Sending…</Text>
              </>
            ) : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.submitText}>Send Feedback</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 300,
    lineHeight: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: COLORS.primary,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
