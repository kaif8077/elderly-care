const elderlyCareTheme = {
  cssVar: true,
  token: {
    colorPrimary: '#0066ff', colorPrimaryHover: '#ff6b00', colorPrimaryActive: '#ff6b00',
    colorLink: '#0066ff', colorLinkHover: '#ff6b00', colorLinkActive: '#ff6b00',
    colorInfo: '#0066ff', colorSuccess: '#0066ff', colorWarning: '#ff6b00', colorError: '#ff6b00',
    colorText: '#1f2937', colorTextSecondary: '#667085', colorBgLayout: '#f6f8fc', colorBgContainer: '#ffffff', colorBorder: '#d8dee9',
    borderRadius: 10, borderRadiusLG: 16, controlHeight: 32, fontSize: 14,
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", boxShadowSecondary: '0 18px 48px rgba(18, 63, 53, 0.12)'
  },
  components: {
    Button: {
      fontWeight: 400,
      controlHeight: 30,
      controlHeightSM: 28,
      controlHeightLG: 42,
      paddingInline: 14,
      defaultFontSize: 14,
      contentFontSize: 14,
      contentFontSizeSM: 14,
      contentFontSizeLG: 14,
      defaultBg: '#0066ff',
      defaultColor: '#ffffff',
      primaryShadow: 'none',
      defaultBorderColor: '#0066ff',
      defaultHoverColor: '#ff6b00',
      defaultHoverBorderColor: '#ff6b00',
      defaultActiveColor: '#ff6b00',
      defaultActiveBorderColor: '#ff6b00'
    },
    Card: { headerBg: '#ffffff' },
    Layout: { bodyBg: '#f3f7f5', headerBg: '#ffffff', siderBg: '#0066ff' },
    Menu: {
      itemColor: '#1f2937', itemHoverColor: '#ff6b00', itemSelectedColor: '#ff6b00',
      itemSelectedBg: '#edf3ff', itemHoverBg: '#fff4ec',
      horizontalItemHoverColor: '#ff6b00', horizontalItemSelectedColor: '#ff6b00',
      darkItemBg: '#0066ff', darkItemSelectedBg: '#ff6b00',
      darkItemSelectedColor: '#ffffff', darkItemHoverBg: '#ff6b00'
    },
    Table: { headerBg: '#f3f6fc', headerColor: '#1f2937' }
  }
};
export default elderlyCareTheme;
