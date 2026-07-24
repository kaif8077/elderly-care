const elderlyCareTheme = {
  cssVar: true,
  token: {
    colorPrimary: '#176b57', colorInfo: '#176b57', colorSuccess: '#2f7d5c', colorWarning: '#b7791f', colorError: '#b42318',
    colorText: '#183c33', colorTextSecondary: '#5c746d', colorBgLayout: '#f3f7f5', colorBgContainer: '#ffffff', colorBorder: '#d9e5e1',
    borderRadius: 12, borderRadiusLG: 18, controlHeight: 44, fontSize: 16,
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", boxShadowSecondary: '0 18px 48px rgba(18, 63, 53, 0.12)'
  },
  components: {
    Button: { fontWeight: 700, primaryShadow: 'none' }, Card: { headerBg: '#ffffff' },
    Layout: { bodyBg: '#f3f7f5', headerBg: '#ffffff', siderBg: '#123f35' },
    Menu: { darkItemBg: '#123f35', darkItemSelectedBg: '#ffffff', darkItemSelectedColor: '#123f35', darkItemHoverBg: '#1d594c' },
    Table: { headerBg: '#edf4f2', headerColor: '#183c33' }
  }
};
export default elderlyCareTheme;
