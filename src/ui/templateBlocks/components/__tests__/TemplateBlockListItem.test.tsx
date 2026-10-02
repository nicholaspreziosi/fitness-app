import { TemplateBlockListItem } from '@/src/ui/templateBlocks/components/TemplateBlockListItem';
import { presentedActionSheet } from '@/test-utils/actionSheet';
import { createMockTemplateBlock } from '@/test-utils/mockData';
import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  DarkTheme: { colors: {} },
  DefaultTheme: { colors: {} },
}));

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    GestureHandlerRootView: View,
    Swipeable: ({
      children,
      renderRightActions,
    }: {
      children: React.ReactNode;
      renderRightActions?: () => React.ReactNode;
    }) => (
      <View>
        {children}
        {renderRightActions?.()}
      </View>
    ),
  };
});


describe('TemplateBlockListItem', () => {
  it('shows archive and delete actions for active template blocks', () => {
    render(
      <TemplateBlockListItem
        block={createMockTemplateBlock({ id: 'block-1', status: 'active' })}
        onArchive={jest.fn()}
        onDelete={jest.fn()}
        onPress={jest.fn()}
        onRestore={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );

    expect(screen.getByTestId('archive-template-block-1')).toBeTruthy();
    expect(screen.getByTestId('delete-template-block-1')).toBeTruthy();
  });

  it('shows restore and delete actions for archived template blocks', () => {
    render(
      <TemplateBlockListItem
        block={createMockTemplateBlock({ id: 'block-1', status: 'archived' })}
        onArchive={jest.fn()}
        onDelete={jest.fn()}
        onPress={jest.fn()}
        onRestore={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );

    expect(screen.getByTestId('restore-template-block-1')).toBeTruthy();
    expect(screen.getByTestId('delete-template-block-1')).toBeTruthy();
    expect(screen.queryByTestId('archive-template-block-1')).toBeNull();
  });

  it('shows delete confirmation copy', () => {
    render(
      <TemplateBlockListItem
        block={createMockTemplateBlock({ id: 'block-1', status: 'active' })}
        onArchive={jest.fn()}
        onDelete={jest.fn()}
        onPress={jest.fn()}
        onRestore={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );

    fireEvent.press(screen.getByTestId('delete-template-block-1'));

    const sheet = presentedActionSheet();
    expect(sheet.title).toBe('Delete this template block?');
    expect(sheet.options).toEqual(['Delete', 'Cancel']);
    expect(sheet.destructiveButtonIndex).toBe(0);
  });
});
