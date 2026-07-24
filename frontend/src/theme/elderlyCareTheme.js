const elderlyCareTheme = {
  cssVar: true,
  token: {
    colorPrimary: '#0066ff', colorPrimaryHover: '#ff6b00', colorPrimaryActive: '#0066ff',
    colorLink: '#0066ff', colorLinkHover: '#ff6b00', colorLinkActive: '#0066ff',
    colorInfo: '#0066ff', colorSuccess: '#0066ff', colorWarning: '#ff6b00', colorError: '#ff6b00',
    colorText: '#1f2937', colorTextSecondary: '#667085', colorBgLayout: '#f6f8fc', colorBgContainer: '#ffffff', colorBorder: '#d8dee9',
    borderRadius: 10, borderRadiusLG: 16, controlHeight: 36, fontSize: 15,
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", boxShadowSecondary: '0 18px 48px rgba(18, 63, 53, 0.12)'
  },
  components: {
    Button: { fontWeight: 700, primaryShadow: 'none', defaultHoverColor: '#ff6b00', defaultHoverBorderColor: '#ff6b00' }, Card: { headerBg: '#ffffff' },
    Layout: { bodyBg: '#f3f7f5', headerBg: '#ffffff', siderBg: '#0066ff' },
    Menu: {
      itemColor: '#1f2937', itemHoverColor: '#ff6b00', itemSelectedColor: '#0066ff',
      horizontalItemHoverColor: '#ff6b00', horizontalItemSelectedColor: '#0066ff',
      darkItemBg: '#0066ff', darkItemSelectedBg: '#ffffff',
      darkItemSelectedColor: '#0066ff', darkItemHoverBg: '#ff6b00'
    },
    Table: { headerBg: '#f3f6fc', headerColor: '#1f2937' }
  }
};
export default elderlyCareTheme;
