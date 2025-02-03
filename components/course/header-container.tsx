import { View } from 'react-native';

const HeaderContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <View className="flex flex-none flex-row items-center bg-white shadow ring-1 ring-black ring-opacity-5">
      {children}
    </View>
  );
};

export default HeaderContainer;
