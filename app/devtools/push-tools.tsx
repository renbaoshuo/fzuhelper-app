import PageContainer from '@/components/page-container';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import ExpoUmengModule from '@/modules/umeng-bridge';
import Clipboard from '@react-native-clipboard/clipboard';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { toast } from 'sonner-native';

const NAVIGATION_TITLE = '推送工具';

export default function PushToolsPage() {
  const [tagInput, setTagInput] = useState(''); // 用于输入 tag 的状态

  // 获取当前权限状态
  const getPushPermission = async () => {
    const hasPermission = await ExpoUmengModule.hasPermission();
    toast.info('通知权限状态: ' + hasPermission);
  };

  // 请求通知权限
  const requirePermission = async () => {
    ExpoUmengModule.requirePermission();
    toast.success('请求通知权限');
  };

  // 手动初始化友盟
  const setupUmeng = async () => {
    ExpoUmengModule.initUmeng();
    toast.success('已经发送初始化请求，10 秒后检查注册状态即可');
  };

  // 获取设备的 DeviceToken
  const getDeviceToken = async () => {
    const token = await ExpoUmengModule.getDeviceToken();
    Clipboard.setString(token);
    toast.success('DeviceToken: ' + token);
  };

  // 检查设备是否已经注册远程推送
  const isRegisteredForRemoteNotifications = async () => {
    const isRegistered = await ExpoUmengModule.isRegisteredForRemoteNotifications();
    toast.info('设备远程推送注册状态: ' + isRegistered);
  };

  // 获取推送注册错误
  const getPushRegisterError = async () => {
    const error = await ExpoUmengModule.getError();
    if (!error) {
      toast.success('没有产生任何错误');
      return;
    }
    toast.info('错误列表: \n' + error);
  };

  // 获取 AppKey 和 Channel
  const getAppKeyAndChannel = async () => {
    const result = await ExpoUmengModule.getAppKeyAndChannel();
    toast.success('AppKey 和 Channel: ' + result);
  };

  // 获取全部 Tag
  const getAllTags = async () => {
    const result = await ExpoUmengModule.getAllTags();
    toast.success('全部 Tag: ' + result.data.join(', ') + '\n剩余可用：' + result.remain + '\nerror: ' + result.error);
  };

  // 添加 Tag
  const addTag = async () => {
    const tags = tagInput.trim().split(/\s+/); // 按照空格分割标签
    if (tags.length === 0 || tags.some(tag => !tag)) {
      toast.error('请输入一个有效的 Tag');
      return;
    }
    try {
      await ExpoUmengModule.addTags(tags);
      toast.info('已发送添加 Tag 请求，待添加 tags: ' + tags.join(', '));
    } catch (error) {
      toast.error('添加 Tag 失败: ' + error);
    }
  };

  // 删除 Tag
  const deleteTag = async () => {
    const tags = tagInput.trim().split(/\s+/); // 按照空格分割标签
    if (tags.length === 0 || tags.some(tag => !tag)) {
      toast.error('请输入一个有效的 Tag');
      return;
    }
    try {
      await ExpoUmengModule.deleteTags(tags);
      toast.info('已发送删除 Tag 请求，待删除 tags: ' + tags.join(', '));
    } catch (error) {
      toast.error('添加 Tag 失败: ' + error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: NAVIGATION_TITLE }} />

      <PageContainer>
        <KeyboardAwareScrollView className="h-full" keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>推送相关功能</Text>

          <Button onPress={getPushPermission}>
            <Text>Check Push Permission</Text>
          </Button>
          <Button onPress={requirePermission}>
            <Text>Require Push Permission</Text>
          </Button>
          <Button onPress={setupUmeng}>
            <Text>Init Umeng</Text>
          </Button>
          <Button onPress={getDeviceToken}>
            <Text>Show And Copy DeviceToken</Text>
          </Button>
          <Button onPress={isRegisteredForRemoteNotifications}>
            <Text>Check Push Register Status</Text>
          </Button>
          <Button onPress={getPushRegisterError}>
            <Text>Get Push Register Error</Text>
          </Button>
          <Button onPress={getAppKeyAndChannel}>
            <Text>Get AppKey And Channel</Text>
          </Button>

          <Text style={styles.sectionTitle}>Tag 管理</Text>

          {/* 输入框，用于输入自定义的 Tag */}
          <TextInput
            style={styles.input}
            placeholder="请输入 Tag(多个 tag 之间用空格分割)"
            value={tagInput}
            onChangeText={setTagInput}
          />

          <Button onPress={addTag}>
            <Text>Add Tag</Text>
          </Button>
          <Button onPress={deleteTag}>
            <Text>Delete Tag</Text>
          </Button>
          <Button onPress={getAllTags}>
            <Text>Get All Tags</Text>
          </Button>
        </KeyboardAwareScrollView>
      </PageContainer>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    marginLeft: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    margin: 10,
  },
});
