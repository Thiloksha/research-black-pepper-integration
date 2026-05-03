import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { C } from './theme';

export function PrimaryButton({ title, onPress, loading, style }) {
  return (
    <TouchableOpacity
      style={[s.primaryBtn, style, loading && s.disabledBtn]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={C.white} />
      ) : (
        <Text style={s.primaryBtnTxt}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function OutlineButton({ title, onPress, style }) {
  return (
    <TouchableOpacity
      style={[s.outlineBtn, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={s.outlineBtnTxt}>{title}</Text>
    </TouchableOpacity>
  );
}

export function EmptyState({ emoji, title, subtitle }) {
  return (
    <View style={s.emptyWrap}>
      <Text style={s.emptyEmoji}>{emoji}</Text>
      <Text style={s.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={s.emptySub}>{subtitle}</Text> : null}
    </View>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <View style={s.errorWrap}>
      <Text style={s.errorTitle}>⚠️ Connection Error</Text>
      <Text style={s.errorTxt}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={s.errorRetry} onPress={onRetry}>
          <Text style={s.errorRetryTxt}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function StatusBadge({ label, color }) {
  return (
    <View style={[s.badge, { borderColor: color, backgroundColor: color + '15' }]}>
      <Text style={[s.badgeTxt, { color }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  primaryBtn: {
    backgroundColor: C.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  primaryBtnTxt: { color: C.white, fontSize: 15, fontWeight: '800' },
  disabledBtn: { opacity: 0.7 },
  outlineBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: C.primary,
  },
  outlineBtnTxt: { color: C.primary, fontSize: 15, fontWeight: '800' },
  emptyWrap: { padding: 40, alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.text, marginBottom: 8 },
  emptySub: { fontSize: 13, color: C.text3, textAlign: 'center', lineHeight: 20 },
  errorWrap: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorTitle: { fontSize: 14, fontWeight: '800', color: C.error, marginBottom: 6 },
  errorTxt: { fontSize: 13, color: C.error, lineHeight: 18 },
  errorRetry: { marginTop: 10, alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, backgroundColor: 'rgba(229,57,53,0.1)', borderRadius: 6 },
  errorRetryTxt: { fontSize: 12, fontWeight: '700', color: C.error },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeTxt: { fontSize: 10, fontWeight: '800' },
});
